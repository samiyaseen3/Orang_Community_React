<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    // Fetch user profile data
    public function show(Request $request)
    {
        try {
            $user = $request->user();
            
            return response()->json([
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'academy' => $user->academy,
                'socialmedia' => $user->socialmedia,
                'profile_picture' => $user->image ? asset('storage/' . $user->image) : null,
            ]);
        } catch (\Exception $e) {
            Log::error('Profile Show Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update user profile
    public function updateProfile(Request $request)
    {
        Log::info('Update Profile Request Data:', $request->all());

        // Validate the incoming data
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:users,id',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'academy' => 'required|string|max:255',
            'socialmedia' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'password' => 'nullable|string|min:6',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
                'message' => 'Validation failed'
            ], 400);
        }
    
        try {
            // Retrieve the user by ID
            $user = User::findOrFail($request->id);
    
            // Update user details
            $user->full_name = $request->full_name;
            $user->email = $request->email;
            $user->academy = $request->academy;
            $user->socialmedia = $request->socialmedia;
    
            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($user->image && Storage::exists('public/' . $user->image)) {
                    Storage::delete('public/' . $user->image);
                }
                
                // Store new image
                $imagePath = $request->file('image')->store('uploads/profile', 'public');
                $user->image = $imagePath;
            }
    
            // Handle password update
            if ($request->filled('password')) {
                $user->password = bcrypt($request->password);
            }
    
            // Save the updated user details
            $user->save();
    
            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'academy' => $user->academy,
                    'socialmedia' => $user->socialmedia,
                    'profile_picture' => $user->image ? asset('storage/' . $user->image) : null,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Profile Update Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while updating profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserPosts(Request $request)
{
    try {
        $user = $request->user();

        // Fetch user's posts with relationships (likes, comments, etc.)
        $posts = Post::where('user_id', $user->id)
            ->with([
                'comments' => function ($query) {
                    $query->with('user:id,full_name')->latest();
                },
                'likes',
                'user:id,full_name',
            ])
            ->latest()
            ->get();

        return response()->json([
            'message' => 'User posts fetched successfully',
            'posts' => $posts,
        ]);
    } catch (\Exception $e) {
        Log::error('Error fetching user posts: ' . $e->getMessage());
        return response()->json([
            'message' => 'Error fetching user posts',
            'error' => $e->getMessage(),
        ], 500);
    }
}

}