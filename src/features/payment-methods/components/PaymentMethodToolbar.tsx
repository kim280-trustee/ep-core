import {
  Link,
} from "react-router-dom";

interface PaymentMethodToolbarProps {

  search: string;

  onSearchChange: (
    value: string,
  ) => void;

}

export function PaymentMethodToolbar({

  search,

  onSearchChange,

}: PaymentMethodToolbarProps) {

  return (

    <div
      className="
        flex
        gap-4
        mb-6
      "
    >

      <input
        value={search}
        onChange={(event) =>
          onSearchChange(
            event.target.value,
          )
        }
        placeholder="Search payment methods..."
        className="
          border
          rounded
          p-2
          flex-1
        "
      />

      <Link
        to="/payment-methods/create"
        className="
          bg-black
          text-white
          px-4
          py-2
          rounded
        "
      >

        Add Payment Method

      </Link>

    </div>

  );

}