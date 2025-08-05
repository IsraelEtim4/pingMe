import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers (req, res) {

  try {
    const currentUserId = req.userDetails.id;
    // const currentUser = await User.findById(currentUserId);
    const currentUser = req.userDetails; // You can use above to acheive same task

    // Check users that are onboarded and not in friends list
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnboarded: true },
      ],
    });
    res.status(200).json(recommendedUsers);
    // res.status(200).json({ success: true, recommendedUsers})
  } catch (error) {
    console.log("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" })
  }
};

export async function getMyFriends (req, res) {
  try {
    const user = await User.findById(req.userDetails.id)
      .select("friends")
      .populate("friends", "username profilePicture learningLanguage nativeLanguage");

    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export async function sendFriendRequest (req, res) {
  try {
    const myId = req.userDetails.id; // get my Id
    const { idx:recipientId } = req.params; // grab Id of the other user. Note: after the column is a rename

    // Prevent sending request to ourself
    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send friend request to yourself"})
    }

    // Check if recipient exist
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(400).json({ message: "Recipient not found" })
    }

    // If you're already friends
    if (recipient.friends.includes(myId)) {
      return res.status(400),json({ message: "You're already friends with this user" })
    }

    // Check if user is already a friend
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    // Check if user already has a friend request
    if (existingRequest) {
      return res.status(400).json({ message: "A friend request already exist between you and this user" })
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(200).json(friendRequest);
  } catch (error) {
    console.log("Error in sendFriendRequest Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" })
  }
};

export async function acceptFriendRequest(req, res) {
  try {
    const {idx:requestId} = req.params; // friend request id
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" })
    };

    // Verify if the current user is the recipient. Although this suggestion is a wrong because you're supposed to send friend request to a particular person...
    if (friendRequest.recipient.toString() !== req.userDetails.id) {
      return res.status(404).json({ message: "You are not authorized to accept this request!" })
    }

    friendRequest.status = "accepted"; // the status will be accepted after all checked and passed to be accepted
    await friendRequest.save(); // then save to the database

    // add each users to the other's friends array. That is, put my id to friends array and vice versa
    // $addToSet is a method in mongoDB that adds elements to an array only if they do not already exist
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    
    // add each users to the other's friends array. That is, put my id to friends array and vice versa
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ messagea: "Internal Server Error" });
  }
};

export async function getFriendRequests(req, res) {
  try {
    // fetch incoming friend request
    const incomingRequest = await FriendRequest.find({
      recipient: req.userDetails.id,
      status: "pending",
    }).populate("sender", "username profilePicture nativeLanguage learningLanguage");

    // fetch incoming friend request
    const acceptedRequest = await FriendRequest.find({
      sender: req.userDetails.id,
      status: "accepted",
    }).populate("sender", "username profilePicture")

    res.status(200).json({ incomingRequest, acceptedRequest })
  } catch (error) {
    console.log("Error in getFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export async function getOutgoingFriendRequests(req, res) {
  try {
    // 
    const outgoingRequests = await FriendRequest.find({
      sender: req.userDetails.id,
      status: "pending",
    }).populate("recipient", "username profilePicture nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};