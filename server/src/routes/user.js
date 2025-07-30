import express from "express";
import { 
  acceptFriendRequest, 
  getFriendRequests, 
  getMyFriends, 
  getOutgoingFriendRequests, 
  getRecommendedUsers, 
  sendFriendRequest 
} from "../controller/user.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes below it
router.use("/", protectRoute);

router.get("/", getRecommendedUsers);
router.get("/", getMyFriends);

router.post("/friend-request/:idx", sendFriendRequest);
router.put("/friend-request/:idx/accept", acceptFriendRequest);

// you might want to add more routes, like
// router.put("/friend-request/:idx/reject", rejectFriendRequest);

router.get("/friend-request", getFriendRequests);
router.get("/outgoing-friend-request", getOutgoingFriendRequests);

export default router;