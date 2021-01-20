import React, { useState, useEffect } from "react";
import "../styles.css";
import Base from "./Base";
import Card from "./Card";
import { loadCart } from "./helper/carthelper";
import { isAuthenticated } from "../auth/helper";
import { Link } from "react-router-dom";
import StripeCheckout from "react-stripe-checkout";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { emptyCart } from "./helper/carthelper";
import { API } from "../backend";

toast.configure();

const Cart = () => {
	const [products, setProducts] = useState([]);
	const [reload, setReload] = useState(false);
	const [loading, setLoading] = useState(true);
	const [payLoading, setPayLoading] = useState(false);

	const getPrice = () => {
		var price = 0;
		for (var i = 0; i < products.length; i++) price += products[i].price;
		return price;
	};

	useEffect(() => {
		(async () => {
			const ps = await loadCart(isAuthenticated().user._id);
			setProducts(ps);
			setLoading(false);
		})();
	}, [reload]);

	const loadAllProducts = () => {
		if (products.length === 0) return "No items in your cart. Go add some now!";
		else
			return (
				<div>
					{products.map((product, index) => (
						<Card
							key={index}
							product={product}
							addtoCart={false}
							removeFromCart={true}
							setReload={setReload}
							reload={reload}
							cart={true}
						/>
					))}
				</div>
			);
	};

	const loadCheckout = () => {
		const product = { price: getPrice(), user: isAuthenticated().user._id };
		async function handleToken(token, addresses) {
			setPayLoading(true);
			const response = await axios.post("http://localhost:8000/api/checkout", {
				token,
				product,
			});
			emptyCart(() => {
				const data = JSON.stringify({
					products,
					price: getPrice(),
				});
				fetch(`${API}/saveOrder/${isAuthenticated().user._id}`, {
					method: "POST",
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
						Authorization: `Bearer ${isAuthenticated().token}`,
					},
					body: JSON.stringify(data),
				})
					.then(R => R.json())
					.then(resp => {
						console.log(resp);
						setPayLoading(false);
					});
			});
			const { status } = response.data;
			console.log("Response: ", response.data);
			if (status === "success")
				toast("Payment successful! Check email for details", {
					type: "success",
				});
			else toast("Something went wrong", { type: "error" });
		}

		return (
			<>
				{payLoading ? (
					<div className="alert alert-info">
						<h2>Loading... Do not refresh the page.</h2>
					</div>
				) : (
					<>
						<h2>This Section for Checking out:</h2>
						<StripeCheckout
							stripeKey="pk_test_51IBXOSJZ5SfvqGzXiCyNg9KYR752jDXw1VmT0ZZJk4TtGnh0uioNCnLYWj1RMLPExNgyc5Py80yvr5zprsFQCdTp00MgYD5aGu"
							token={handleToken}
							amount={getPrice() * 100}
							name="Products"
							billingAddress
							shippingAddress
						/>
					</>
				)}
			</>
		);
	};

	return (
		<Base title="Cart Page" description="Ready to checkout">
			<div className="row text-white">
				{!isAuthenticated().user ? (
					<h6>
						Please <Link to="/signin">SignIn</Link> first.
					</h6>
				) : (
					<>
						<div className="col-md-6">
							<h2>Your Cart:</h2>
							{loading ? <h2>Loading Cart...</h2> : loadAllProducts()}
						</div>
						<div className="col-md-6">{loadCheckout()}</div>
					</>
				)}
			</div>
		</Base>
	);
};

export default Cart;
