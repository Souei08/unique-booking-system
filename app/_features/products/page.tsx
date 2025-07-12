import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ProductTable from "./components/ProductTable";
import CreateProduct from "./components/CreateProduct";

export default async function ProductsPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <CreateProduct />
      </div>
      <ProductTable products={products || []} />
    </div>
  );
}
