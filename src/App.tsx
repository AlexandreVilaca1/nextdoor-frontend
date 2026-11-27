import { BrowserRouter, Routes, Route } from "react-router-dom"

import { Home } from "./pages/home"
import { Login } from "./pages/login"
import TaskCreated from "./pages/taskCreatedPage"
import TaskRealization from "./pages/taskRealizationPage"
import Notification from "./pages/notificationPage"
import { Register } from "./pages/register"
import { AdminDashboard } from "./pages/AdminDashboard"
import { AdminUsers } from "./components/dashboard/pages/AdminUser"
import { AdminProduct } from "./components/dashboard/pages/AdminProduct"
import { AdminEstablishments } from "./components/dashboard/pages/AdminEstablishments"
import { UserProduct} from "./pages/User/UserProduct"
import { AdminRedemptionCodes } from "./components/dashboard/pages/AdminRedemptionCodes"
import { UserRedemptionCodes} from "./pages/User/UserRedemptionCodes"
import {UserEditProfile} from "./pages/User/UserEditProfile"
import {AdminCategory} from "./components/dashboard/pages/AdminCategory"

import { UnauthorizedPage } from "./pages/Error/401";
import { ForbiddenPage } from "./pages/Error/403";
import { InternalServerErrorPage } from "./pages/Error/500";
import { ServiceUnavailablePage } from "./pages/Error/503";
import {NotFoundPage} from "./pages/Error/404"


function App() {

  	return (
    	<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />}></Route>
				<Route path="/login" element={<Login />}></Route>
				<Route path="/register" element={<Register/>}></Route>
				<Route path="/tasksCreated" element={<TaskCreated />}></Route>
				<Route path="/tasksRealization" element={<TaskRealization />}></Route>
				<Route path="/notifications" element={<Notification />}></Route>
				<Route path="/admin" element={<AdminDashboard />}></Route> 
				<Route path="/admin-user" element={<AdminUsers />} />
				<Route path="/admin-product" element={<AdminProduct />} />
				<Route path="/admin-establishments" element={<AdminEstablishments />} />
				<Route path="/user-product" element={<UserProduct />} />
				<Route path="/admin-codes" element={<AdminRedemptionCodes />} />
				<Route path="/usercodes" element={<UserRedemptionCodes />} />
				<Route path="/edit-profile" element={<UserEditProfile/>} />
				<Route path="/admin-category" element={<AdminCategory/>} />

				<Route path="/unauthorized" element={<UnauthorizedPage />} />
            	<Route path="/forbidden" element={<ForbiddenPage />} />
            	<Route path="/server-error" element={<InternalServerErrorPage />} />
				<Route path="/service-unavailable" element={<ServiceUnavailablePage />} />
				<Route path="*" element={<NotFoundPage/>} />
			</Routes>
    	</BrowserRouter>
  	)
}

export default App
