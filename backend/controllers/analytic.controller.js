import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { get } from "mongoose";

export const getAnalytics = async(req, res) => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" },
            },
        },
    ]);
    
    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    return {
        users:totalUsers,
        products:totalProducts,
        totalSales,
        totalRevenue
    }
}

export const getDailySalesData = async(startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);
    
        const dateArray = getDatesInRange(startDate, endDate);
        // console.log(dateArray);
    
        return dateArray.map((date) => {
            const foundData = dailySalesData.find((data) => data._id === date);
    
            return {
                date,
                sales: foundData?.sales || 0,
                revenue: foundData?.totalRevenue || 0
            }
        });
    } catch (error) {
        throw error;
    }
}

function getDatesInRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}