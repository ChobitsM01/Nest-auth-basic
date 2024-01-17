import { IUser } from '@/users/users.interface';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';;
import { RegisterUserDto } from '@/users/dto/create-user.dto';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
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

    async login(user: IUser) {
        const { _id, name, email, role } = user;
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };
        return {
            access_token: this.jwtService.sign(payload),
            _id,
            name,
            email,
            role
        };
    }

    async register(registerUserDto: RegisterUserDto) {
        let check = await this.usersService.findOneByUsername(registerUserDto.email);

        if (check) {
            return 'Email đã tồn tại';
        } else {
            let newUser = await this.usersService.register(registerUserDto);
            return {
                _id: newUser?._id,
                createdAt: newUser?.createdAt
            };
        }
    }

}
