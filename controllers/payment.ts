if (process.env.NODE_ENV !== "production") require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import "express-async-errors";
import { Stripe } from "stripe";
import CustomError from "../interfaces/custom_error";
const stripe: Stripe = require("stripe")(process.env.STRIPE_TEST_KEY);

export const stripePay = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response> => {
    try {
        const stripeVendorAccount = "acct_1IsaR5QnHKlA9Khh";
        stripe;

        const rPaymentMethod: Stripe.Response<Stripe.PaymentMethod> =
            await stripe.paymentMethods.create(
                {
                    payment_method: req.query.paym + "",
                },
                {
                    stripeAccount: stripeVendorAccount,
                }
            );

        const paymentIntent: Stripe.PaymentIntent =
            await stripe.paymentIntents.create({
                amount: parseInt(req.query.amount + "", 10),
                currency: req.query.currency + "",
                payment_method: rPaymentMethod.id,
                confirmation_method: "automatic",
                confirm: true,
                description: req.query.description + "",
            });

        return res.status(200).send({
            message: "Payment Successful",
            paymentIntent,
            stripeVendorAccount,
            uid: req.userId,
        });
    } catch (err) {
        const error = new CustomError("Payment Success");
        error.statusCode = 500;
        error.data = err;
        throw error;
    }
};
