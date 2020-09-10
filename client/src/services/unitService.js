export const units = [
  { _id: "0", name: "" },
  { _id: "2", name: "Tsp" },
  { _id: "3", name: "Tbsp" },
  { _id: "4", name: "Dash" },
  { _id: "5", name: "Smidgen" },
  { _id: "6", name: "Pinch" },
  { _id: "7", name: "Drop" },
  { _id: "8", name: "Ounce" },
  { _id: "9", name: "Fluid Ounce" },
  { _id: "10", name: "Gram" },
  { _id: "11", name: "Pint" },
  { _id: "12", name: "Gallon" },
  { _id: "13", name: "Liter" },
  { _id: "14", name: "Cup" },
  { _id: "15", name: "Lb" },
  { _id: "16", name: "Each" },
  { _id: "17", name: "Can" },
  { _id: "18", name: "Sticks" },
  { _id: "19", name: "Slices" },
  { _id: "20", name: "Shot" },
  { _id: "21", name: "Package" },  
  { _id: "22", name: "Quart" },  
];

export function getUnits() {
  return units.sort((a, b) => (a.name > b.name ? 1 : -1));
}
