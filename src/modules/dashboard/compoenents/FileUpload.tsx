// import { useState } from "react";
import Papa from "papaparse";
// import useAppDispatch from "../../../shared/hooks/useAppDispatch";
// import { uploadProduct } from "../dashboardSlice";

type Product = {
    id: number;
    name: string;
    price: number;
};
  
type ParsedProduct = Omit<Product, "id">;

const FileUpload: React.FC = () => {
    // const dispatch = useAppDispatch();

    const saveOrder = (product: ParsedProduct) => {
      console.log("Saving product:", product);
        // dispatch(uploadProduct(product));
      };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      Papa.parse<ParsedProduct>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsedData = result.data; // Type-safe ParsedProduct[]
          console.log("Parsed Data:", parsedData);
          
          // Save each product
          parsedData.forEach((product) => saveOrder(product));
        },
        error: (err) => {
          console.error("Error parsing CSV:", err);
        },
      });
    };
  
    return (
    <input type="file" accept=".csv" onChange={handleFileChange} />
    );
  };

export default FileUpload;
