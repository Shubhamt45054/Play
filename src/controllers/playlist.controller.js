import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

  if (!name) throw new ApiError(400, "Name required");

  const playlist = await Playlist.create({
    name,
    description: description || "",
    owner: req.user?._id,
  });

  if (!playlist) throw new ApiError(500, "Error while creating Playlist");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Created Successfully"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {

    //TODO: get user playlists
    // user id lelo....
    const { userId } = req.params;
  if (!isValidObjectId(userId))
    throw new ApiError(400, "Valid userId required");

  // THINKME : playlist thumbnail
    console.log(req.user);
  // playlist mei owner ko user id se match karoo.., ho paye tho..
  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
        // abb owner mei jake uski details leke aoo
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              avatar: 1,
              username: 1,
              views: 1,
            },
          },
        ],
      },
    },
    {
        // videos ki id hai video ki detial bhi chiye ..
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $project: {
              thumbnail: 1,
              views: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner",
    },
    {
        // kya kya chiye , 
        // kuch array ayengi tho sirf first chiye..
      $project: {
        name: 1,
        description: 1,
        owner: 1,
        thumbnail: 1,
        videosCount: 1,
        createdAt: 1,
        updatedAt: 1,
        thumbnail: {
          $first: "$videos.thumbnail",
        },
        videosCount: {
          $size: "$videos",
        },
        totalViews: {
          $sum: "$videos.views",
        },
      },
    },
  ]);

  console.log(playlists);
  
  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlist sent successfully"));
})

const getPlaylistById = asyncHandler(async (req, res) => {

    //TODO: get playlist by id
    // playlist ki id ..
    const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "plese give valid playlist id");
  }
  const playlists = await Playlist.aggregate([
    {
        // finding playlist ...
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
        // saari video leke aooo. 
        // unka thumbnil aur views ...
        // video ka owner ka detila chiye ek aur piple lagegai..
        // in only been published..
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $match: { isPublished: true },
          },
          {
            // video owners detials..
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
    {
        // abb jo playlist ka onwer hai 
        // uski bhi detiails hai ...
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videos: 1,
        owner: 1,
        thumbnail: 1,
        videosCount: 1,
        createdAt: 1,
        updatedAt: 1,
        thumbnail: {
          $first: "$videos.thumbnail",
        },
        videosCount: {
          $size: "$videos",
        },
        totalViews: {
          $sum: "$videos.views",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, playlists[0], "Playlist sent successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Please give valid id");
  }
// valid id then update kar do...
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
        // only add if alreday doesn't not exist..
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!playlist)
    throw new ApiError(500, "Error while adding video to playlist");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isAdded: true },
        "Video added to playlist successfully"
      )
    );
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    // TODO: remove video from playlist
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
      throw new ApiError(400, "plaese give valid video or playlist id");
    }
  
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: {
          videos: videoId,
        },
      },
      {
        new: true,
      }
    );
  
    if (!playlist)
      throw new ApiError(500, "Error while removing video from playlist");
  
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isSuccess: true },
          "Video removed from playlist successfully"
        )
      );

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid PlaylistId");
  }
  const playlist = await Playlist.findByIdAndDelete(playlistId);

  if (!playlist) throw new ApiError(500, "Error while deleting Playlist");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isDeleted: true }, "Playlist deleted successfully")
    );
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    const { playlistId } = req.params;
    const { name, description } = req.body;
  
    if (!isValidObjectId(playlistId) || (!name && !description))
      throw new ApiError(400, "All fields required");
  
    // playlist leke ayee..
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(400, "No Playlist Found");
  
    // just in case extra space hai...
    playlist.name = name.trim();
    playlist.description = description.trim();
    // playlist update kar di...

    // if (name) playlist.name = name;
    // if (description) playlist.description = description;
  
    // usko save kar diyaa..
    const updatedPlaylist = await playlist.save();
  
    if (!updatedPlaylist)
      throw new ApiError(500, "Error while updating playlist");
  
    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedPlaylist, "Playlist Updated successfully")
      );
})

const getVideoSavePlaylists = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
  
    if (!isValidObjectId(videoId))
      throw new ApiError(400, "Valid videoId required");
  
    // check if specific video is in playlist ...
    const playlists = await Playlist.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user?._id),
        },
      },
      {
        $project: {
          name: 1,
          isVideoPresent: {
            $cond: {
              if: { $in: [new mongoose.Types.ObjectId(videoId), "$videos"] },
              then: true,
              else: false,
            },
          },
        },
      },
    ]);
  
    return res
      .status(200)
      .json(new ApiResponse(200, playlists, "Playlists sent successfully"));
  });

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    getVideoSavePlaylists,
}
