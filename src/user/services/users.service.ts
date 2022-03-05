import {
  Injectable,
  HttpStatus,
  HttpException,
  BadRequestException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO, UserDTO } from '../dto';
import { encodeToken, decodeToken } from '../../common/utils/helper';
import { IUser } from '../interfaces';

/**
 * User Service
 */
@Injectable()
export class UsersService {
  private readonly password = 'oS1H+dKX1+OkXUu3jABIKqThi5/BJJtB0OCo';
  /**
   * Constructor
   * @param {Model<IUser>} userModel
   */
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<IUser>,
  ) {}

  /**
   * Create a user with RegisterPayload fields
   * @param {CreateUserDTO} createUserDTO user payload
   * @returns {Promise<IUser>} created user data
   */
  async register(createUserDTO: CreateUserDTO): Promise<IUser> {
    try {
      const userDTO = new UserDTO();
      userDTO.email = createUserDTO.email.toLowerCase();
      const isUserExist = await this.userModel.findOne({
        email: userDTO.email,
      });
      if (isUserExist) {
        return Promise.reject(
          new NotAcceptableException(
            `User already exist with the ${userDTO.email}`,
          ),
        );
      }
      userDTO.password = bcrypt.hashSync(createUserDTO.password, 8);
      userDTO.isAdmin = createUserDTO.isAdmin || false;
      userDTO.otp = Math.round(1000 + Math.random() * 9000);
      userDTO.otpExpiresAt = Date.now() + 15 * 60 * 1000;

      const registerModel = new this.userModel(userDTO);
      const newUser = await registerModel.save();

      const token = {
        _id: newUser._id,
        email: userDTO.email,
      };
      const updateDTO = new UserDTO();
      updateDTO.emailProofToken = await encodeToken(token, this.password);
      updateDTO.emailProofTokenExpiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
      updateDTO.cBy = newUser._id;
      updateDTO.uBy = newUser._id;
      updateDTO.uTime = Date.now();
      return await newUser.set(updateDTO).save();
    } catch (err) {
      throw new HttpException(err, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * generate password reset token
   * @param {string} email
   * @returns {Promise<object>}
   */
  async generatePasswordResetToken(email: string): Promise<Record<any, any>> {
    try {
      const userEmail = email.toLowerCase();
      const user = await this.userModel.findOne({ email: userEmail });

      if (!user) {
        return Promise.reject(new NotFoundException('User not found.'));
      }

      const resetMinutes = 15;

      if (
        user.passwordResetTokenExpiresAt >
        Date.now() + (resetMinutes - 1) * 60 * 1000
      )
        return Promise.reject(
          new BadRequestException('You can generate token after 1 minute'),
        );

      const token = {
        _id: user._id,
        email: user.email,
      };
      const updateDTO = new UserDTO();
      updateDTO.passwordResetToken = await encodeToken(token, this.password);
      updateDTO.passwordResetTokenExpiresAt =
        Date.now() + resetMinutes * 60 * 1000; // 15 minutes
      updateDTO.uBy = user._id;
      await user.set(updateDTO).save();
      return { data: '', message: 'Token Generated Successfully !' };
    } catch (err) {
      throw new HttpException(err, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * reset user password using token
   * @returns {Promise<object>}
   * @param {string} token
   * @param {string} newPassword
   */
  public async forgetPassword(
    token: string,
    newPassword: string,
  ): Promise<any> {
    try {
      const decryptedJson = await decodeToken(token, this.password);
      const user = await this.userModel.findById(decryptedJson._id);
      if (!user) {
        return Promise.reject(new NotFoundException('User not found.'));
      }

      if (user && user.get('passwordResetTokenExpiresAt')) {
        const now = Date.now();

        if (user.get('passwordResetTokenExpiresAt') < now) {
          return Promise.reject(new BadRequestException('Token is expire!'));
        } else if (user.get('passwordResetToken') !== token) {
          return Promise.reject(new BadRequestException('Invalid Token!'));
        } else {
          const passwordIsValid = bcrypt.compareSync(
            newPassword,
            user.password,
          );

          if (passwordIsValid) {
            return Promise.reject(
              new BadRequestException('Already used this password'),
            );
          } else {
            return await user
              .set({
                password: bcrypt.hashSync(newPassword, 8),
                uBy: decryptedJson._id,
                passwordResetTokenExpiresAt:
                  Date.now() - 365 * 24 * 60 * 60 * 1000,
              })
              .save();
          }
        }
      } else {
        return Promise.reject(new BadRequestException('Token is not found!'));
      }
    } catch (err) {
      throw new HttpException(err, err.status || HttpStatus.BAD_REQUEST);
    }
  }
}
