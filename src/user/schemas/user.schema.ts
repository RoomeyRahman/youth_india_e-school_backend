import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    minlength: 3,
    maxlength: 30,
  })
  firstName: string;

  @Prop({
    minlength: 3,
    maxlength: 30,
  })
  lastName: string;

  @Prop()
  otp: number;

  @Prop()
  otpExpiresAt: number;

  @Prop()
  emailProofToken: string;

  @Prop()
  emailProofTokenExpiresAt: number;

  @Prop()
  passwordResetToken: string;

  @Prop()
  passwordResetTokenExpiresAt: number;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: Date.now() })
  cTime: number;

  @Prop()
  cBy: string;

  @Prop({ default: Date.now() })
  uTime: number;

  @Prop()
  uBy: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    return {
      _id: ret._id,
      email: ret.email,
      isActive: ret.isActive,
      firstName: ret.firstName,
      lastName: ret.lastName,
    };
  },
});
