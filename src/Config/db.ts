import { connect } from 'mongoose'

const connectDB = async (): Promise<void> => {
  try {
    await connect(process.env.MONGO_URI!)
  } catch (error) {
    console.log(error)
  }


  console.log('MongoDB Connected'.cyan.underline.bold)
}

export default connectDB
