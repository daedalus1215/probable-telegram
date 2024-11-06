import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../app/dtos/create-user.dto';
import { User, UserDocument } from '../infra/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async createUser(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
        const { username, password } = createUserDto;

        const existingUser = await this.userModel.findOne({ username });
        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const createdUser = new this.userModel({
            username,
            password: hashedPassword,
        });

        const savedUser = await createdUser.save();

        const { password: _, ...result } = savedUser.toObject();
        return result;
    }

    async findByUsername(username: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ username });
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id);
    }
}
