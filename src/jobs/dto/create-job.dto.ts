import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsDate, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;
}

export class CreateJobDto {
  @IsNotEmpty({ message: 'Name không được để trống', })
  name: string;

  @IsArray({ message: 'Skills phải là một mảng' })
  @ArrayMinSize(1, { message: 'Ít nhất một kỹ năng phải được cung cấp' })
  @IsString({ each: true, message: 'Mỗi kỹ năng phải là một chuỗi' })
  skills: string[];

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;

  @IsNotEmpty({ message: 'Location không được để trống', })
  location: string;

  @IsNumber({}, { message: 'Salary phải là number' })
  @IsNotEmpty({ message: 'Salary không được để trống', })
  salary: number;

  @IsNumber({}, { message: 'Quantity phải là number' })
  @IsNotEmpty({ message: 'Quantity không được để trống', })
  quantity: number;

  @IsNotEmpty({ message: 'Description không được để trống', })
  description: string;

  @IsNotEmpty({ message: 'Start date không được để trống', })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'End date có định dạng Date' })
  startDate: Date;

  @IsNotEmpty({ message: 'End date không được để trống', })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'End date có định dạng Date' })
  endDate: Date;

  @IsNotEmpty({ message: 'isActive không được để trống', })
  @IsBoolean({ message: 'isActive có định dạng boolean' })
  isActive: string;

}  
