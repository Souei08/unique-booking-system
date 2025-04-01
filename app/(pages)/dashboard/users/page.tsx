import { UserPlusIcon } from "@heroicons/react/24/outline";
import Table from "@/app/_components/common/tables";

interface Customer {
  name: string;
  handle: string;
}

const columns = [
  { header: "Name", accessor: "name" as keyof Customer },
  { header: "Handle", accessor: "handle" as keyof Customer },
];

const customers: Customer[] = [
  { name: "John Doe", handle: "johndoe" },
  { name: "Jane Smith", handle: "janesmith" },
];

const CustomersPage = () => {
  return (
    <main className="flex-1">
      {/* Customers Table */}

      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <Table<Customer>
          data={customers}
          columns={columns}
          title="Users"
          description="Manage your users"
          buttonText="Add User"
          handleEdit={() => {}}
          handleSchedule={() => {}}
        />
      </div>
    </main>
  );
};

export default CustomersPage;
