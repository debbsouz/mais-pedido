import { getCustomers } from "@/lib/customers-dal";
import { CustomersManagement } from "@/components/clientes/CustomersManagement";

export default async function ClientesPage() {
  const customers = await getCustomers();

  return <CustomersManagement initialCustomers={customers} />;
}
