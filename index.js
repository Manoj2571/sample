const mongoose = require("mongoose")
const {initialiseDatabase} = require("./db/db.connect")
const express = require("express")
const User = require("./models/user.model")
const Product = require("./models/product.model")
const cors = require("cors")

const port = 3000

const app = express()

const corsOptions = {
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

initialiseDatabase()

app.listen(port, () => {
    console.log("Server is up and running on", port)
})

app.get("/", async (req, res) => {
    res.send("Hello!")
})



app.get("/users", async (req, res) => {
    try {
        const users = await User.find()

        res.send(users)

    } catch (error) {
        console.log(error)
        res.status(501).json({message: "Internal server error"})
    }
})

app.get("/products", async (req, res) => {
    try {
        const products = await Product.find()

        res.send(products)

    } catch (error) {
        console.log(error)
        res.status(501).json({message: "Internal server error"})
    }
})


const updateWishlist = async (req, res) => {
    try {
        const {product} = req.body
        const user = await User.findById(req.params.userId)

        const productIndex =  user.wishlist.findIndex(existingProduct => existingProduct == product)

        if(productIndex == -1) {
            user.wishlist = [...user.wishlist, product]
        } else {
            user.wishlist = user.wishlist.filter(existingProduct => existingProduct != product)
        }

        await user.save()

        return res.status(201).json({message: "User updated successfully.", wishlist: user.wishlist})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "Error occured while updating wishlist."})
    }
}


const updateLoggedInUserData = async (req,res) => {

    try {
    const user = await User.findById(req.params.userId)

   
    req.body.cart.forEach( (product) => {
        const productIndex =  user.cart.findIndex(existingProduct => existingProduct.product == product.product && existingProduct.size == product.size)

        if(productIndex == -1) {
            user.cart = [...user.cart, product]
        } else {
            user.cart[productIndex].quantity += product.quantity
        }
    })

    req.body.wishlist.forEach( (product) => {
        const productIndex =  user.wishlist.findIndex(existingProduct => existingProduct == product)

        if(productIndex == -1) {
            user.wishlist = [...user.wishlist, product]
        }
    })

    await user.save()

    return res.status(201).json({message: "User updated successfully.", user})

    
} catch (error) {
    console.log(error)
    return res.status(500).json({message: "Error occured while updating user."})
}

}

const addToCart = async (req, res) => {
    try {
    const {product, quantity, size} = req.body
    const user = await User.findById(req.params.userId)

    const productIndex =  user.cart.findIndex(existingProduct => existingProduct.product == product && existingProduct.size == size)

        if(productIndex == -1) {
            user.cart = [...user.cart, req.body]
        } else {
            user.cart[productIndex].quantity += quantity
        }

    await user.save()

    return res.status(201).json({message: "User updated successfully.", cart: user.cart})

    } catch (error) {
        console.log(error)
       return res.status(500).json({message: "Error occured while adding product to cart."})
    }
    
    

}

const removeFromCart = async (req, res) => {

    try {

    const {product, size} = req.body

    const user = await User.findById(req.params.userId)

    user.cart = user.cart.filter(cartItem => cartItem.product == product && cartItem.size == size)

    await user.save()

    return res.status(201).json({message: "Product removed from Cart", cart: user.cart})

    }catch (error) {
        console.log(error)
       return res.status(500).json({message: "Error occured while removing product from cart."})
    }
}

const quantityIncrement = async (req, res) => {
    try {

        const user = await User.findById(req.params.userId)

        const itemIndex = user.cart.findIndex(
            (item) =>
              item.product == req.body.product &&
              item.size == req.body.size
          );

        user.cart[itemIndex].quantity += req.body.quantity  

        await user.save()

        return res.status(201).json({message: "Quantity Incremented Successfully.", cart: user.cart})


    } catch (error) {
        return res.status(500).json({message: "Error occured while incrementing quantity."})
    }
}

const quantityDecrement = async (req, res) => {
    try {

        const user = await User.findById(req.params.userId)

        const itemIndex = user.cart.findIndex(
            (item) =>
              item.product == req.body.product &&
              item.size == req.body.size
          );

        user.cart[itemIndex].quantity -= req.body.quantity  

        await user.save()

        return res.status(201).json({message: "Quantity Decremented Successfully.", cart: user.cart})


    } catch (error) {
        return res.status(500).json({message: "Error occured while incrementing quantity."})
    }
}


app.post("/users/updateWishlist/:userId", updateWishlist)

app.post("/users/loggedIn/:userId", updateLoggedInUserData)

app.post("/users/addToCart/:userId", addToCart)

app.post("/users/removeFromCart/:userId", removeFromCart)

app.post("/users/incrementQuantity", quantityIncrement)

app.post("/users/decrementQuantity", quantityDecrement)