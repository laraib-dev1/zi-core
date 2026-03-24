import React from "react";

type Props = {
  title: string;
  price: number | string;
  offer?: string;
  description: string;
};

export default function ProductInfo({ title, price, offer, description }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold">{title}</h1>
      {offer && (
        <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-1 rounded">
          {offer}
        </span>
      )}
      <p className="text-xl font-bold">${price}</p>
      <p className="text-gray-700">{description}</p>
    </div>
  );
}
