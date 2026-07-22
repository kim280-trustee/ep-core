interface Props {
  open: boolean;
}

export function MobileMenu({
  open,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <nav>
      Mobile Menu
    </nav>
  );
}