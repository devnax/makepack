import Button from "./Button";
const sum = (a: number, b: number): number => {
   return a + b;
}
const subtract = (a: number, b: number): number => {
   return a - b;
}
const multiply = (a: number, b: number): number => {
   return a * b;
}
const divide = (a: number, b: number): number => {
   if (b === 0) {
      throw new Error("Cannot divide by zero");
   }
   return a / b;
}
export { sum, subtract, multiply, divide, Button };