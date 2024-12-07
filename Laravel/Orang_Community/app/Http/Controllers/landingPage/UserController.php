<?php

namespace App\Http\Controllers\landingPage;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\User;

class UserController extends Controller
{
    public function searchUsers(Request $request)
    {
        $query = $request->input('query');

        // Search users by full_name, email, or socialmedia
        $users = User::where('full_name', 'LIKE', "%{$query}%")
            ->orWhere('email', 'LIKE', "%{$query}%")
            ->orWhere('socialmedia', 'LIKE', "%{$query}%")
            ->select('id', 'full_name', 'email', 'image', 'academy', 'socialmedia')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ], 200);
    }
}
