import React, { useState, useEffect } from "react";
import Base from "../core/Base";
import { Link } from "react-router-dom";
import {
	getCategories,
	getProduct,
	updateProduct,
} from "./helper/adminapicall";
import { isAuthenticated } from "../auth/helper";

const UpdateProduct = ({ match }) => {
	const { user, token } = isAuthenticated();

	const [values, setValues] = useState({
		name: "",
		description: "",
		price: "",
		stock: "",
		photo: "",
		categories: [],
		category: "",
		loading: false,
		error: "",
		createdProduct: "",
		getaRedirect: false,
		formData: "",
	});
	const [performPreload, setPerformPreload] = useState(true);
	const [dataArrived, setDataArrived] = useState(false);

	const {
		name,
		description,
		price,
		stock,
		categories,
		error,
		createdProduct,
		formData,
	} = values;

	const preload = productId => {
		if (performPreload)
			getProduct(productId).then(data => {
				if (data.error) {
					setValues({ ...values, error: data.error });
					setPerformPreload(false);
				} else {
					preloadCategories();
					setValues({
						...values,
						name: data.name,
						description: data.description,
						price: data.price,
						category: data.category._id,
						stock: data.stock,
						formData: new FormData(),
					});
					setPerformPreload(false);
				}
				setDataArrived(true);
			});
	};

	const preloadCategories = () => {
		getCategories().then(data => {
			if (data.error) {
				console.log(data.error);
			} else {
				setValues({
					categories: data,
					formData: new FormData(),
				});
			}
		});
	};

	// eslint-disable-next-line
	useEffect(() => preload(match.params.productId), []);

	const handleChange = name => event => {
		const value = name === "photo" ? event.target.files[0] : event.target.value;
		formData.set(name, value);
		setValues({ ...values, [name]: value });
	};

	const onSubmit = event => {
		event.preventDefault();
		setDataArrived(false);
		setValues({ ...values, error: "", loading: true });
		updateProduct(match.params.productId, user._id, token, formData).then(
			data => {
				if (data.error) {
					setValues({ ...values, error: data.error });
				} else {
					setValues({
						...values,
						name: "",
						description: "",
						price: "",
						stock: "",
						photo: "",
						loading: false,
						createdProduct: data.name,
					});
				}
				setDataArrived(true);
			}
		);
	};

	const successMessage = () => (
		<div
			className="alert alert-success mt-3"
			style={{ display: createdProduct ? "" : "none" }}
		>
			<h4>{createdProduct} updated successfully</h4>
		</div>
	);

	const errorMessage = () => (
		<div
			className="alert alert-danger mt-3"
			style={{ display: error ? "" : "none" }}
		>
			{error}
		</div>
	);

	const createProductForm = () => (
		<form>
			<span>Post Photo</span>
			<div className="form-gorup">
				<label className="btn btn-block btn-success">
					<input
						onChange={handleChange("photo")}
						type="file"
						name="photo"
						accept="image"
						placeholder="choose a file"
					/>
				</label>
			</div>
			<div className="form-group">
				<input
					onChange={handleChange("name")}
					name="photo"
					className="form-control"
					placeholder="Name"
					value={name}
				/>
			</div>
			<div className="form-group">
				<textarea
					onChange={handleChange("description")}
					name="photo"
					className="form-control"
					placeholder="Description"
					value={description}
				/>
			</div>
			<div className="form-group">
				<input
					onChange={handleChange("price")}
					type="number"
					className="form-control"
					placeholder="Price"
					value={price}
				/>
			</div>
			<div className="form-group">
				<select
					onChange={handleChange("category")}
					className="form-control"
					placeholder="Category"
				>
					<option>Select</option>
					{categories &&
						categories.map((cate, index) => (
							<option key={index} value={cate._id}>
								{cate.name}
							</option>
						))}
				</select>
			</div>
			<div className="form-group">
				<input
					onChange={handleChange("stock")}
					type="number"
					className="form-control"
					placeholder="Quantity"
					value={stock}
				/>
			</div>

			<button
				type="submit"
				onClick={onSubmit}
				className="btn btn-outline-success"
			>
				Update Product
			</button>
		</form>
	);

	return (
		<Base
			title="Add Product"
			description="Welcome to Product creation section"
			className="container bg-info p-4"
		>
			<Link to="/admin/dashboard" className="btn btn-md btn-dark mb-3">
				Admin Home
			</Link>
			<div className="row bg-dark text-white rounded">
				<div className="col-md-8 offset-md-2">
					{successMessage()}
					{errorMessage()}
					{dataArrived ? (
						createProductForm()
					) : (
						<img
							style={{ width: "200px" }}
							src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Youtube_loading_symbol_1_(wobbly).gif"
							alt="loading"
						/>
					)}
				</div>
			</div>
		</Base>
	);
};

export default UpdateProduct;
