import {
  ExpensesPage,
} from "../pages/ExpensesPage";

import {
  CreateExpensePage,
} from "../pages/CreateExpensePage";

import {
  EditExpensePage,
} from "../pages/EditExpensePage";

export const expenseRoutes = [
  {
    path: "/expenses",
    element: <ExpensesPage />,
  },

  {
    path: "/expenses/create",
    element: <CreateExpensePage />,
  },

  {
    path: "/expenses/:id/edit",
    element: <EditExpensePage />,
  },
];
