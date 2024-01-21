import { Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>
  ) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async createAUser(createNewUser: CreateUserDto) {
    let check = await this.findOneByUsername(createNewUser.email);
    if (check) {
      return "Email đã tồn tại";
    }
    else {
      const hashPassword = this.getHashPassword(createNewUser.password);

      let user = await this.userModel.create({
        name: createNewUser.name,
        email: createNewUser.email,
        password: hashPassword,
        age: createNewUser.age,
        gender: createNewUser.gender,
        address: createNewUser.address,
        role: createNewUser.role,
        company: createNewUser.company
      })
      return {
        _id: user._id,
        createdAd: user.createdAt
      };
    }
  }

  findAll() {
    return 'all user';
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `Id không đúng định dạng`;

    return await this.userModel.findOne({
      _id: id
    }).select("-password")
  }

  async fetchUserWithPaginate(currentPage: number, limit: number, qs: string) {
    const { filter, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let { sort } = aqp(qs);
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select("-password")
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username
    })
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne(
      { _id: id },
      { ...updateUserDto, updatedBy: { _id: user._id, email: user.email } }
    )
  }


  async deleteAUser(id: string, user: IUser) {
    let userDel = await this.findOne(id);

    if (!userDel) return 'User không tồn tại!'
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )

    return this.userModel.softDelete({
      _id: id, deletedBy: {
        _id: user._id,
        email: user.email
      }
    })

  }


  async register(registerUserDto: RegisterUserDto) {
    const hashPassword = this.getHashPassword(registerUserDto.password);

    let user = await this.userModel.create({
      name: registerUserDto.name,
      email: registerUserDto.email,
      password: hashPassword,
      age: registerUserDto.age,
      gender: registerUserDto.gender,
      address: registerUserDto.address,
      role: "USER"
    })
    return user;
  }

  async updateUserToken(refresh_token: string, _id: string) {
    return await this.userModel.updateOne(
      { _id },
      { refresh_token }
    )
  }

  async findOneByToken(refresh_token) {
    return await this.userModel.findOne({ refresh_token });
  }
}
