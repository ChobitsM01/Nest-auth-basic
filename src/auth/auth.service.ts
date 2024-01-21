import { IUser } from '@/users/users.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';;
import { RegisterUserDto } from '@/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    //ussername/ pass là 2 tham số thư viện passport nó ném về
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password);
            if (isValid === true) {
                return user;
            }
        }

        return null;
    }

    async login(user: IUser, response) {
        const { _id, name, email, role } = user;
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };
        const refresh_token = this.createRefreshToken(payload);

        //update user token
        await this.usersService.updateUserToken(refresh_token, _id);

        //set refresh token as cookies
        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRED_IN")) * 1000
        });
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email,
                role
            }
        };
    }

    async register(registerUserDto: RegisterUserDto) {
        let check = await this.usersService.findOneByUsername(registerUserDto.email);

        if (check) {
            throw new BadRequestException('Email đã tồn tại!');
        } else {
            let newUser = await this.usersService.register(registerUserDto);
            return {
                _id: newUser?._id,
                createdAt: newUser?.createdAt
            };
        }
    }

    createRefreshToken(payload) {
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: ms(this.configService.get<string>("JWT_REFRESH_EXPIRED_IN")) / 1000
        });
        return refresh_token;
    }

    async processNewToken(refreshToken: string, response: Response) {
        try {
            this.jwtService.verify(refreshToken,
                {
                    secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET")
                }
            );

            let user = await this.usersService.findOneByToken(refreshToken);
            if (user) {
                const { _id, name, email, role } = user;
                const payload = {
                    sub: "token refresh",
                    iss: "from server",
                    _id,
                    name,
                    email,
                    role
                };
                const refresh_token = this.createRefreshToken(payload);

                //update user token
                await this.usersService.updateUserToken(refresh_token, _id.toString());

                response.clearCookie('refresh_token');


                // set refresh token as cookies
                response.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRED_IN")) * 1000
                });
                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id,
                        name,
                        email,
                        role
                    }
                };
            } else {
                throw new BadRequestException('Token không đúng!')
            }

        } catch (error) {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn')
        }
    }

    async handleLogOut(user: IUser, response: Response) {
        if (user) {
            this.usersService.updateUserToken('', user._id);
            response.clearCookie('refresh_token');
            return 'Log out ok';
        }
        else {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        }
    }

}
