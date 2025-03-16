import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../app/dtos/create-user.dto';
import { User } from '../infra/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
        const { username, password } = createUserDto;

        const existingUser = await this.userRepository.findOne({ where: { username } });
        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.userRepository.create({
            username,
            password: hashedPassword,
        });

        const savedUser = await this.userRepository.save(user);
        const { password: _, ...result } = savedUser;
        return result;
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { username } });
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }
}
