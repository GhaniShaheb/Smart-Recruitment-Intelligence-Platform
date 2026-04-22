import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectdb } from "./config/db.js"

// Route imports
import notesRoutes from "./routes/notesRoutes.js"
import candidateComparisonRoutes from "./routes/candidateComparisonRoutes.js"
import recruiterPerformanceRoutes from "./routes/recruiterPerformanceRoutes.js"
import hiringPredictionRoutes from "./routes/hiringPredictionRoutes.js"
import emailNotificationRoutes from "./routes/emailNotificationRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

connectdb()

// Middleware
app.use(express.json())
app.use(cors())

// Request logging middleware
app.use((req,res,next) =>{
    console.log(`Req method is ${req.method} & Req URL is ${req.url}`)
    next()
})

// API Routes
app.use("/api/notes", notesRoutes)
app.use("/api/candidates/compare", candidateComparisonRoutes)
app.use("/api/recruiters", recruiterPerformanceRoutes)
app.use("/api/predictions", hiringPredictionRoutes)
app.use("/api/notifications", emailNotificationRoutes)


app.listen(5001, () => {
    console.log("Server started on port PORT:", PORT)
})

//ismaeelghani_db_user
//72uahkIRbAKYA7oL
//mongodb+srv://ismaeelghani_db_user:72uahkIRbAKYA7oL@cluster0.34gyjy4.mongodb.net/?appName=Cluster0//question mark er baame db name deya lagbe
//mongodb://ismaeelghani_db_user:72uahkIRbAKYA7oL@ac-sjnstjb-shard-00-00.34gyjy4.mongodb.net:27017,ac-sjnstjb-shard-00-01.34gyjy4.mongodb.net:27017,ac-sjnstjb-shard-00-02.34gyjy4.mongodb.net:27017/smarthr?ssl=true&replicaSet=atlas-wieqbm-shard-0&authSource=admin&appName=Cluster0
//mongodb+srv://samiranaahee2019_db_user:l2m5WAkGCnLmetGa@cluster0.lkvbymp.mongodb.net/?appName=Cluster0