import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Plus, Bookmark, Trash2, Edit2, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CommunityHub = () => {
  const [communities, setCommunities] = useState([
    {
      id: 1,
      name: 'Coding Enthusiasts',
      members: 234,
      content: 'public/Community_1.jpg',
      description: 'A space for passionate programmers to collaborate and learn',
      tags: ['Programming', 'Tech', 'Learning'],
      posts: [
        {
          id: 1,
          author: 'Alex Kumar',
          content: (
            <div>
              <p>Just wrapped up an amazing React workshop! Check out the resources below 👇</p>
              <img 
                src="public/Community_1.jpg" 
                alt="Community Image" 
                className="mt-4 rounded-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          ),
          likes: 45,
          comments: 12,
          isLiked: false,
          isSaved: false,
          timestamp: new Date().toISOString(),
          commentsList: []
        }
      ],
      isJoined: false
    },
    {
      id: 2,
      name: 'Art Club',
      members: 156,
      description: 'Express yourself through various art forms',
      tags: ['Art', 'Creative', 'Design'],
      posts: [
        {
          id: 1,
          author: 'Priya Shah',
          content: (
            <div>
              <p>Just wrapped up an amazing React workshop! Check out the resources below 👇</p>
              <img 
                src="public/download.jpeg" 
                alt="Community Image" 
                className="mt-4 rounded-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          ),
          likes: 32,
          comments: 8,
          isLiked: false,
          isSaved: false,
          timestamp: new Date().toISOString(),
          commentsList: []
        }
      ],
      isJoined: false
    }
  ]);

  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    tags: ''
  });

  const [newPosts, setNewPosts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState('');
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message) => {
    setNotification(message);
  };

  const handleCreateCommunity = () => {
    if (!newCommunity.name || !newCommunity.description) {
      showNotification('Please fill in all required fields');
      return;
    }

    const community = {
      id: communities.length + 1,
      name: newCommunity.name,
      members: 1,
      description: newCommunity.description,
      tags: newCommunity.tags.split(',').map(tag => tag.trim()),
      posts: [],
      isJoined: true
    };

    setCommunities([...communities, community]);
    setNewCommunity({ name: '', description: '', tags: '' });
    showNotification('Community created successfully!');
  };

  const handleCreatePost = (communityId) => {
    const content = newPosts[communityId];
    if (!content?.trim()) {
      showNotification('Please write something to post');
      return;
    }

    const updatedCommunities = communities.map(community => {
      if (community.id === communityId) {
        const newPost = {
          id: community.posts.length + 1,
          author: 'Current User',
          content,
          likes: 0,
          comments: 0,
          isLiked: false,
          isSaved: false,
          timestamp: new Date().toISOString(),
          commentsList: []
        };
        return {
          ...community,
          posts: [newPost, ...community.posts]
        };
      }
      return community;
    });

    setCommunities(updatedCommunities);
    setNewPosts({ ...newPosts, [communityId]: '' });
    showNotification('Post created successfully!');
  };

  const handleLike = (communityId, postId) => {
    setCommunities(communities.map(community => {
      if (community.id === communityId) {
        return {
          ...community,
          posts: community.posts.map(post => {
            if (post.id === postId) {
              const newIsLiked = !post.isLiked;
              showNotification(newIsLiked ? 'Post liked!' : 'Post unliked');
              return {
                ...post,
                likes: newIsLiked ? post.likes + 1 : post.likes - 1,
                isLiked: newIsLiked
              };
            }
            return post;
          })
        };
      }
      return community;
    }));
  };

  const handleSavePost = (communityId, postId) => {
    setCommunities(communities.map(community => {
      if (community.id === communityId) {
        return {
          ...community,
          posts: community.posts.map(post => {
            if (post.id === postId) {
              const newIsSaved = !post.isSaved;
              showNotification(newIsSaved ? 'Post saved!' : 'Post unsaved');
              return { ...post, isSaved: newIsSaved };
            }
            return post;
          })
        };
      }
      return community;
    }));
  };

  const handleDeletePost = (communityId, postId) => {
    setCommunities(communities.map(community => {
      if (community.id === communityId) {
        return {
          ...community,
          posts: community.posts.filter(post => post.id !== postId)
        };
      }
      return community;
    }));
    showNotification('Post deleted successfully');
  };

  const handleAddComment = (communityId, postId) => {
    const commentKey = `${communityId}-${postId}`;
    const commentContent = newComments[commentKey]?.trim();
    
    if (!commentContent) {
      showNotification('Please write a comment first');
      return;
    }

    setCommunities(communities.map(community => {
      if (community.id === communityId) {
        return {
          ...community,
          posts: community.posts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: post.comments + 1,
                commentsList: [...post.commentsList, {
                  id: post.commentsList.length + 1,
                  author: 'Current User',
                  content: commentContent,
                  timestamp: new Date().toISOString()
                }]
              };
            }
            return post;
          })
        };
      }
      return community;
    }));

    setNewComments({ ...newComments, [commentKey]: '' });
    showNotification('Comment added successfully!');
  };

  const handleJoinCommunity = (communityId) => {
    setCommunities(communities.map(c => {
      if (c.id === communityId) {
        const newIsJoined = !c.isJoined;
        showNotification(newIsJoined ? 'Joined community!' : 'Left community');
        return {
          ...c,
          members: newIsJoined ? c.members + 1 : c.members - 1,
          isJoined: newIsJoined
        };
      }
      return c;
    }));
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {notification && (
        <Alert className="mb-4 bg-blue-50">
          <AlertDescription>{notification}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Communities</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Community</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Community Name"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                />
                <Input
                  placeholder="Tags (comma-separated)"
                  value={newCommunity.tags}
                  onChange={(e) => setNewCommunity({ ...newCommunity, tags: e.target.value })}
                />
                <Button onClick={handleCreateCommunity}>Create Community</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Input
          placeholder="Search communities by name, description, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-6">
        {filteredCommunities.map(community => (
          <Card key={community.id} className="w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{community.name}</CardTitle>
                  <p className="text-sm text-gray-500">{community.members} members</p>
                </div>
                <Button
                  variant={community.isJoined ? "outline" : "default"}
                  onClick={() => handleJoinCommunity(community.id)}
                >
                  {community.isJoined ? 'Leave' : 'Join'}
                </Button>
              </div>
              <p>{community.description}</p>
              <div className="flex flex-wrap gap-2">
                {community.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-gray-100">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {community.posts.map(post => (
                <Card key={post.id} className="w-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{post.author}</p>
                        <p className="text-sm text-gray-500">{formatDate(post.timestamp)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSavePost(community.id, post.id)}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(community.id, post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{post.content}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="ghost"
                      className={post.isLiked ? 'text-red-500' : ''}
                      onClick={() => handleLike(community.id, post.id)}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const key = `${community.id}-${post.id}`;
                        setShowComments(prev => ({
                          ...prev,
                          [key]: !prev[key]
                        }));
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </CardFooter>
                  {showComments[`${community.id}-${post.id}`] && (
                    <CardContent>
                      <div className="space-y-4">
                        {post.commentsList.map(comment => (
                          <div key={comment.id} className="p-3 bg-gray-50 rounded">
                            <div className="flex justify-between items-start">
                              <p className="font-semibold text-sm">{comment.author}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(comment.timestamp)}
                              </p>
                            </div>
                            <p className="mt-1">{comment.content}</p>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a comment..."
                            value={newComments[`${community.id}-${post.id}`] || ''}
                            onChange={(e) => setNewComments(prev => ({
                              ...prev,
                              [`${community.id}-${post.id}`]: e.target.value
                            }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(community.id, post.id);
                              }
                            }}
                          />
                          <Button onClick={() => handleAddComment(community.id, post.id)}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {/* Continuing from the previous CardContent section */}
                    </CardContent>
                  )}
                </Card>
              ))}
            </CardContent>

            <CardFooter>
              <div className="w-full flex gap-2">
                <Input
                  placeholder="Write a post..."
                  value={newPosts[community.id] || ''}
                  onChange={(e) => setNewPosts(prev => ({ ...prev, [community.id]: e.target.value }))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCreatePost(community.id);
                    }
                  }}
                />
                <Button onClick={() => handleCreatePost(community.id)}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunityHub;