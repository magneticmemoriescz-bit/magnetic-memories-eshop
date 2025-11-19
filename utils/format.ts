
export const formatPrice = (price: number | undefined): string => {
  if (price === undefined) return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};
