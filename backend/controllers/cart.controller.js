import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
    try {
        const products = await Product.find({ _id: { $in: req.user.cartItems } });

        const cartItems = products.map((product) => {
            const item = req.user.cartItems.find(item => item.productId === product._id.toString());
            return {...product.toJSON(), quantity:item.quantity};
        });
        res.status(200).json({ cartItems });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const addToCart = async (req, res) => {
    
    try {
        const { productId} = req.body;
        const user = req.user;
        
        const existingItem = user.cartItems.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push( productId );
        }

        await user.save();
        res.status(200).json({ message: "Product added to cart successfully", cartItems: user.cartItems });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const removeAllFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter(item => item.productId !== productId);
        }
        await user.save();
        res.status(200).json({ message: "Product removed from cart successfully", cartItems: user.cartItems });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const updateQuantity = async (req, res) => {
    try {
        const { id:productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;
        const existingItem = user.cartItems.find(item => item.productId === productId);
        if (existingItem) {
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter(item => item.productId !== productId);
                await user.save();
                return res.status(200).json({ message: "Product removed from cart successfully", cartItems: user.cartItems });
            }

            existingItem.quantity = quantity;
            await user.save();
            res.status(200).json({ message: "Product quantity updated successfully", cartItems: user.cartItems });
        } else {
            res.status(404).json({ message: "Product not found in cart" });
        }
        await user.save();
        res.status(200).json({ message: "Product quantity updated successfully", cartItems: user.cartItems });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}