import { Router } from "express";
import { customerTeamsController } from "../controllers/customer-teams.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const customerTeamsRouter = Router();

customerTeamsRouter.use(requireAuth, requireRole("CUSTOMER"));

customerTeamsRouter
	.route("/me/teams")
	.get(customerTeamsController.list)
	.post(customerTeamsController.create);

customerTeamsRouter
	.route("/me/teams/:teamId")
	.get(customerTeamsController.getDetail)
	.put(customerTeamsController.rename)
	.delete(customerTeamsController.delete);

customerTeamsRouter
	.route("/me/teams/:teamId/members")
	.post(customerTeamsController.addMember);

customerTeamsRouter
	.route("/me/teams/:teamId/members/:memberId")
	.put(customerTeamsController.updateMember)
	.delete(customerTeamsController.deleteMember);
