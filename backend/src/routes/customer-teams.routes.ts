import { Router } from "express";
import { customerTeamsController } from "../controllers/customer-teams.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const customerTeamsRouter = Router();

const requireCustomer = [requireAuth, requireRole("CUSTOMER")] as const;

customerTeamsRouter
	.route("/me/teams")
	.all(...requireCustomer)
	.get(customerTeamsController.list)
	.post(customerTeamsController.create);

customerTeamsRouter
	.route("/me/teams/:teamId")
	.all(...requireCustomer)
	.get(customerTeamsController.getDetail)
	.put(customerTeamsController.rename)
	.delete(customerTeamsController.delete);

customerTeamsRouter
	.route("/me/teams/:teamId/members")
	.all(...requireCustomer)
	.post(customerTeamsController.addMember);

customerTeamsRouter
	.route("/me/teams/:teamId/members/:memberId")
	.all(...requireCustomer)
	.put(customerTeamsController.updateMember)
	.delete(customerTeamsController.deleteMember);
