const products=require("./models/productSchema");
const productsdata=require("./constant/productsdata");

const DefaultData=async()=>{
    try {
       
        await products.deleteMany({});
        const storeData=await products.insertMany(productsdata);
        console.log(storeData);
        
    } catch (error) {

        console.log(error)
        
    }
}


module.exports= DefaultData;