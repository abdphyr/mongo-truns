import mongoose from "mongoose";
import currency from 'currency.js';
import initDatabase from './init';
import { User } from "./models/model.user";
import { Journal } from "./models/model.journal";

const transferMoney = async (senAccNum: string, recAccNum: string, amount: number) => {
    //malumotla omboriga ulanib olib unda bizga kerakli bo'lgan 
    // na'lumotlarni yozib olamiz
    await initDatabase()
    
    // sessiyani boshlaymiz !!!
    const session = await mongoose.startSession()

    // sessiyamiz ichida tranzaksiya ochamiz
    session.startTransaction()
    try {
        // jo'natuvchini bazadan izlab topamiz, bunda bizga so'rov berilyapdi
        // shunig uchun tranzaksiya ichida bajariladigan barcha so'rovlarga
        // sessiyani ham berib yuborishimiz kerak
        const sender = await User.findOne({ accountNumber: senAccNum }).session(session)
        if (!sender) {
            throw new Error('Sender not found')
        }
        // jo'natuvchinig hisobidan transaksiya miqdoricha pulni olib tashlaymiz
        sender.balance = currency(sender.balance).subtract(amount).value

        // agarda uning hisobida yetarli pul bo'lmasa xato qaytaramiz
        if (sender.balance < 0) {
            throw new Error(`User - ${sender.name} has insufficent funds`)
        }
        // jo'natuvchiga qilingan o'zgarishlarni bazaga yozib qo'yamiz
        // bu yerda sessiya obyektini berishni keragi yo'q
        await sender.save()
        // jo'natuvchining hisobidan pul yechib olingan amal haqida jurnalga yozamiz

        const debitJournal = new Journal({
            accountNumber: sender.accountNumber,
            operation: 'Debit',
            amount: amount
        })
        await debitJournal.save()

        // pul qabul qilib oluvchini bazadan izlab topamiz agar topilmasa xato qaytaramiz
        const reciever = await User.findOne({ accountNumber: recAccNum }).session(session)
        if (!reciever) {
            throw new Error('Reciever not found')
        }
        // oluvchining hisobuiga tranzaksiya miqdoricha pul qo'shamiz
        // va uni bazaga yoizib qo'yamiz
        reciever.balance = currency(reciever.balance).add(amount).value
        await reciever.save()

        // oluvchinig hisobiga pul qo'shilganlik amalini juralga yozib qo'yamiz
        const creditJournal = new Journal({
            accountNumber: reciever.accountNumber,
            operation: 'Credit',
            amount: amount
        })
        await creditJournal.save()
        /// AGARDA SHU YERGACHA MUVAFFAQIYATLI DAVOM ETIB KELSA COMMIT QILAMIZ
        await session.commitTransaction()
        console.log('Transuction has been completd successfully!!!')
    } catch (error) {
        // Agarda yuqorida tyr bloki ichida biironta xato ro'y bersa 
        // unda qilingan o'zgarishlar bekor qilinadi
        // va malumotlar bazasiga hech narsa yozilamydi
        await session.abortTransaction()
        console.log(error)
        throw error
    } finally {
        // har qanday holatda ham ish oxirida sessiyani yopamiz
        session.endSession()
    }
}

export default transferMoney

