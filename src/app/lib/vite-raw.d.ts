declare module "*.csv?raw" {
  const content: string;
  export default content;
}

declare module "*.wav" {
  const src: string;
  export default src;
}
