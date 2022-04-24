import mongoose from "mongoose";
import { User } from "./models/model.user";

const conString = 'mongodb://....'
const initDatabase = async () => {
    // bazaa ulanamiz
    mongoose.connect(conString, {
        replicaSet: 'rs'
    })
    const senderAccountNumber = 'SA1002001'
    const receiverAccountNumber = 'SA3104215'

    // jonatuvchini hisob raqami bo'yicha bazadan izlab koramiz
    const sender = await User.findOne({ accountNumber: senderAccountNumber })
    // agar topilasa yangi document qo'shamiz
    if (!sender) {
        const sender = new User({
            accountNumber: senderAccountNumber,
            name: 'Ahmad',
            balance: 50000
        })
        await sender.save()
    }
    // qabul qiluvchini  hisob raqami bo'yicha bazadan izlab koramiz
    const receiver = await User.findOne({ accountNumber: receiverAccountNumber })
    // agar topilasa yangi document qo'shamiz
    if (!receiver) {
        const receiver = new User({
            accountNumber: receiverAccountNumber,
            name: 'Ahmad',
            balance: 50000
        })
        await receiver.save()
    }
    
}

export default initDatabase






