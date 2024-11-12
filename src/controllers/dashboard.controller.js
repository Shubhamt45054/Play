import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    // empty object 
  const channelStats = {};

  // video states ...
  // video mei owner wali videos...
  const videoStates = await Video.aggregate([
    {
      $match: {
        owner: req.user?._id,
      },
    },
    {
      $group: {
        _id: null,  // Grouping all the videos together
      totalViews: { $sum: "$views" },  // Sums up the views for all videos
      totalVideos: { $count: {} },  // Counts the total number of videos
      },
    },
  ]);

  // subsriber kitne hai ...
  const subscriber = await Subscription.aggregate([
    {
      $match: {
        channel: req.user?._id,
      },
    },
    {
      $count: "totalSubscribers", // Counts the number of subscribers
    },
  ]);

  // total likes .. video 
  const totalLikes = await Like.aggregate([
    {
      $match: {
        video: { $ne: null }, // Only considers records where the "video" field is not null
        liked: true,
      },
    },
    // like se video liye , abb video ke likes hai
    // abb video ki id ko replace ki video say jo ki owner ki hai sirf..
    // use claculate karenge likes..
    {
      $lookup: {
        from: "videos",
        localField: "video",  // References the video ID in the "likes" collection
        foreignField: "_id", // Joins it with the "videos" collection
        as: "channelVideo",
        pipeline: [
          {
            $match: {
              owner: req.user?._id, // Filters only videos owned by the current user
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channelVideo: {
          $first: "$channelVideo", // Extracts the first matched video
        },
      },
    },
    {
      $match: {
        channelVideo: { $ne: null }, // Ensures that the video belongs to the user
      },
    },
    {
      $group: {
        _id: null, // Groups all likes together
        likeCount: {
          $sum: 1, // Sums the total number of likes
        },
      },
    },
  ]);

  channelStats.ownerName = req.user?.fullName;
  channelStats.totalViews = (videoStates && videoStates[0]?.totalViews) || 0;
  channelStats.totalVideos = (videoStates && videoStates[0]?.totalVideos) || 0;
  channelStats.totalSubscribers = (subscriber && subscriber[0]?.totalSubscribers) || 0;

  channelStats.totalLikes = (totalLikes && totalLikes[0]?.likeCount) || 0;

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "Channel states sent successfully")
    );

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const allVideos = await Video.aggregate([
        {
            // sari video jiske owner user hai ...
          $match: {
            owner: new mongoose.Types.ObjectId(req.user?._id),
          },
        },
        {
            // sort karo created at ke hisab se...
          $sort: {
            createdAt: -1,
          },
        },
        // lookup for likes
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "video",
            as: "likes",
            pipeline: [
              {
                $match: {
                  liked: true,
                },
              },
            ],
          },
        },
        // lookup for dislikes
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "video",
            as: "dislikes",
            pipeline: [
              {
                $match: {
                  liked: false,
                },
              },
            ],
          },
        },
        // lookup for comments
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "video",
            as: "comments",
          },
        },
        {
          $project: {
            title: 1,
            thumbnail: 1,
            isPublished: 1,
            createdAt: 1,
            updatedAt: 1,
            description: 1,
            views: 1,
            likesCount: {
              $size: "$likes",
            },
            dislikesCount: {
              $size: "$dislikes",
            },
            commentsCount: {
              $size: "$comments",
            },
          },
        },
      ]);
    
      return res
        .status(200)
        .json(new ApiResponse(200, allVideos, "All videos fetched successfully"));

})

export {
    getChannelStats, 
    getChannelVideos
    }