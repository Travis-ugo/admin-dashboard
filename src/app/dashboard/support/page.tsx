import AdminLayout from "@/components/AdminLayout";
import { FaqManager } from "@/components/FaqManager";
import { getFaqs } from "@/lib/data-service";

export default async function SupportPage() {
  const faqs = await getFaqs();

  return (
    <AdminLayout>
      <FaqManager initialFaqs={faqs as any} />
    </AdminLayout>
  );
}
