import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({
    minlength: 3,
    maxlength: 30,
  })
  name: string;

  @Prop({
    minlength: 3,
    maxlength: 40,
  })
  nameSlug: string;

  @Prop({
    unique: true,
    minlength: 3,
    maxlength: 40,
  })
  slug: string;

  @Prop()
  price: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now() })
  cTime: number;

  @Prop()
  cBy: string;

  @Prop({ default: Date.now() })
  uTime: number;

  @Prop()
  uBy: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.set('toJSON', {
  transform: function (doc, ret) {
    return {
      _id: ret._id,
      name: ret.name,
      slug: ret.slug,
      price: ret.price,
      isActive: ret.isActive,
    };
  },
});
