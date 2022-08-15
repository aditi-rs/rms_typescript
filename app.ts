import  express from 'express';
const app = express();
import  adminRoutes from './routes/admin';
import  subadminRoutes from './routes/subadmin';
import  userRoutes from './routes/user';
import {errorHandler} from './middleware/errorHandlingMiddleware';

app.use(express.json());
app.use('/admin',adminRoutes);
app.use('/subadmin',subadminRoutes);
app.use('/user',userRoutes);

app.use(errorHandler);

app.listen(3000,()=>{

    console.log("listening on port no 3000!!")
    
    }
)