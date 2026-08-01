import { useEffect } from "react";
import api from "../services/api";

export default function Home() {

    useEffect(() => {

        api.get("/products")
            .then(res => {
                console.log(res.data);
            })
            .catch(err => {
                console.log(err);
            });

    }, []);

    return (
        <div className="container mt-5">
            <h1>Furniture Store</h1>
        </div>
    );
}