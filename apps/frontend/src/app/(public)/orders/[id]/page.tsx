import { redirect } from "next/navigation";
import OrderDetail from "./_components/OrderDetail";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string; success?: string }>;
}) {
  const { id } = await params;
  const { payment, success } = await searchParams;

  if (!id || isNaN(Number(id))) redirect("/orders");

  return (
    <OrderDetail
      orderId={Number(id)}
      paymentStatus={payment ?? null}
      isNewOrder={success === "true"}
    />
  );
}
