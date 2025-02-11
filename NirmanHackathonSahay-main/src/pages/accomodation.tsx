import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, MapPin, Users, Clock, Phone, Filter, Heart, Utensils, Book, ShoppingCart, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Sample data types
type Property = {
  id: number;
  type: string;
  title: string;
  location: string;
  distance: string;
  rent: number;
  deposit: number;
  amenities: string[];
  preferredTenants: string;
  available: string;
  images: string[];
  contactInfo: ContactInfo;
};

type ContactInfo = {
  name: string;
  phone: string;
  email: string;
};

type Favorite = {
  id: number;
  type: 'property' | 'mess' | 'marketplace';
};

type MessService = {
  id: number;
  name: string;
  menu: string[];
  timings: string;
  price: number;
  contactInfo: ContactInfo;
};

type MarketplaceItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: 'books' | 'essentials' | 'others';
  contactInfo: ContactInfo;
};

const Accommodation = () => {
  // Demo data
  const demoProperties: Property[] = [
    {
      id: 1,
      type: 'Flat',
      title: 'Cozy Studio Apartment',
      location: 'Campus North',
      distance: '0.5km from university',
      rent: 15000,
      deposit: 45000,
      amenities: ['WiFi', 'Furnished', 'Power Backup'],
      preferredTenants: 'Students',
      available: 'Immediately',
      images: ['public/Property_1.jpg', '/property2.jpg'],
      contactInfo: {
        name: 'John Doe',
        phone: '+91 98765 43210',
        email: 'john@example.com'
      }
    },
    {
      id: 2,
      type: 'PG',
      title: 'Luxury Girls PG',
      location: 'MG Road',
      distance: '1.2km from campus',
      rent: 12000,
      deposit: 20000,
      amenities: ['AC', 'Laundry', 'Security'],
      preferredTenants: 'Female Students',
      available: '1st Next Month',
      images: ['public/Property_3.jpg'],
      contactInfo: {
        name: 'Riya Sharma',
        phone: '+91 87654 32109',
        email: 'riya.pg@example.com'
      }
    },
    {
      id: 3,
      type: 'Hostel',
      title: 'Boys Hostel',
      location: 'University Road',
      distance: 'On-campus',
      rent: 8000,
      deposit: 15000,
      amenities: ['Mess', 'Study Room', 'Sports Facility'],
      preferredTenants: 'Male Students',
      available: 'Immediately',
      images: ['public/Property_4.jpeg.jpg'],
      contactInfo: {
        name: 'Hostel Warden',
        phone: '+91 76543 21098',
        email: 'hostel.admin@example.com'
      }
    }
  ];

  const demoMessServices: MessService[] = [
    {
      id: 1,
      name: 'Hostel Mess',
      menu: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
      timings: '7:00 AM - 9:00 PM',
      price: 3000,
      contactInfo: {
        name: 'Mess Manager',
        phone: '+91 98765 43210',
        email: 'mess@example.com'
      }
    },
    {
      id: 2,
      name: 'Campus Canteen',
      menu: ['Fast Food', 'Beverages', 'Snacks'],
      timings: '8:00 AM - 10:00 PM',
      price: 2000,
      contactInfo: {
        name: 'Canteen Owner',
        phone: '+91 87654 32109',
        email: 'canteen@example.com'
      }
    }
  ];

  const demoMarketplaceItems: MarketplaceItem[] = [
    {
      id: 1,
      title: 'Engineering Physics Book',
      description: 'Like new, barely used. 2nd Edition.',
      price: 500,
      category: 'books',
      contactInfo: {
        name: 'Rahul',
        phone: '+91 98765 43210',
        email: 'rahul@example.com'
      }
    },
    {
      id: 2,
      title: 'Study Table',
      description: 'Wooden study table with drawer.',
      price: 1200,
      category: 'essentials',
      contactInfo: {
        name: 'Priya',
        phone: '+91 87654 32109',
        email: 'priya@example.com'
      }
    }
  ];

  const handleListNewItem = () => {
    const newItemWithId = {
      ...newItem,
      id: marketplaceItems.length + 1 // Generate a new ID
    };
    setMarketplaceItems(prev => [...prev, newItemWithId]);
    setNewItem({
      id: 0,
      title: '',
      description: '',
      price: 0,
      category: 'books',
      contactInfo: {
        name: '',
        phone: '',
        email: ''
      }
    });
  };
  // State initialization
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Data states
  const [properties, setProperties] = useState<Property[]>(demoProperties);
  const [messServices, setMessServices] = useState<MessService[]>(demoMessServices);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(demoMarketplaceItems);

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Property filtering logic
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || property.type === selectedType;
    const matchesAmenities = selectedAmenities.length === 0 || 
                            selectedAmenities.every(amenity => property.amenities.includes(amenity));
    return matchesSearch && matchesType && matchesAmenities;
  });

  const [newItem, setNewItem] = useState<MarketplaceItem>({
    id: 0,
    title: '',
    description: '',
    price: 0,
    category: 'books',
    contactInfo: {
      name: '',
      phone: '',
      email: ''
    }
  });
  

  // Favorite management
  const toggleFavorite = (id: number, type: 'property' | 'mess' | 'marketplace') => {
    setFavorites(prev => {
      const exists = prev.find(fav => fav.id === id && fav.type === type);
      return exists ? prev.filter(fav => !(fav.id === id && fav.type === type)) : [...prev, { id, type }];
    });
  };

  // Enhanced card renderer for properties
  const renderPropertyCard = (property: Property) => (
    <Card key={property.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{property.title}</CardTitle>
          <div className="flex gap-2 items-center">
            <Badge>{property.type}</Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toggleFavorite(property.id, 'property')}
            >
              <Heart className={cn(
                favorites.some(f => f.id === property.id && f.type === 'property') && 
                "fill-red-500 text-red-500"
              )} size={16} />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin className="h-4 w-4" />
          <span>{property.location}</span>
          <span className="ml-2">• {property.distance}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Carousel className="w-full">
            <CarouselContent>
              {property.images.map((img, index) => (
                <CarouselItem key={index}>
                  <img src={img} alt="" className="h-48 w-full object-cover rounded-md" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Rent: ₹{property.rent}/mo</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Deposit: ₹{property.deposit}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{property.preferredTenants}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Available {property.available}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Amenities:</h4>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map(amenity => (
                <Badge key={amenity} variant="secondary">{amenity}</Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Contact:</h4>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{property.contactInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>{property.contactInfo.name[0]}</AvatarFallback>
              </Avatar>
              <span>{property.contactInfo.name}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Card renderer for Mess Services
  const renderMessServiceCard = (service: MessService) => (
    <Card key={service.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{service.name}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => toggleFavorite(service.id, 'mess')}
          >
            <Heart className={cn(
              favorites.some(f => f.id === service.id && f.type === 'mess') && 
              "fill-red-500 text-red-500"
            )} size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span>Price: ₹{service.price}/mo</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Timings: {service.timings}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Menu:</h4>
            <div className="flex flex-wrap gap-2">
              {service.menu.map(item => (
                <Badge key={item} variant="secondary">{item}</Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Contact:</h4>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{service.contactInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>{service.contactInfo.name[0]}</AvatarFallback>
              </Avatar>
              <span>{service.contactInfo.name}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Card renderer for Marketplace Items
  const renderMarketplaceItemCard = (item: MarketplaceItem) => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{item.title}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => toggleFavorite(item.id, 'marketplace')}
          >
            <Heart className={cn(
              favorites.some(f => f.id === item.id && f.type === 'marketplace') && 
              "fill-red-500 text-red-500"
            )} size={16} />
          </Button>
        </div>
        <Badge variant="outline">{item.category}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm">
            <p>{item.description}</p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <ShoppingCart className="h-4 w-4" />
            <span>Price: ₹{item.price}</span>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Contact:</h4>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{item.contactInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>{item.contactInfo.name[0]}</AvatarFallback>
              </Avatar>
              <span>{item.contactInfo.name}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Tabs defaultValue="properties">
        <TabsList className="mb-4">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="mess">Mess Service</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties">
          <div className="space-y-6">
            <div className="flex gap-4 flex-wrap">
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 max-w-md"
              />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Flat">Flat</SelectItem>
                  <SelectItem value="PG">PG</SelectItem>
                  <SelectItem value="Hostel">Hostel</SelectItem>
                </SelectContent>
              </Select>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>Advanced Filters</DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label>Amenities</label>
                      <div className="flex flex-wrap gap-2">
                        {['Furnished', 'WiFi', 'Power Backup', 'AC', 'Parking'].map(amenity => (
                          <Button
                            key={amenity}
                            variant={selectedAmenities.includes(amenity) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedAmenities(prev => 
                              prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
                            )}
                          >
                            {amenity}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProperties.map(renderPropertyCard)}
            </div>
          </div>
        </TabsContent>

        {/* Mess Service Tab */}
        <TabsContent value="mess">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {messServices.map(renderMessServiceCard)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="marketplace">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> List Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>List a New Item</DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value) => setNewItem({ ...newItem, category: value as 'books' | 'essentials' | 'others' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="books">Books</SelectItem>
                          <SelectItem value="essentials">Essentials</SelectItem>
                          <SelectItem value="others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Name</Label>
                      <Input
                        value={newItem.contactInfo.name}
                        onChange={(e) => setNewItem({ ...newItem, contactInfo: { ...newItem.contactInfo, name: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Phone</Label>
                      <Input
                        value={newItem.contactInfo.phone}
                        onChange={(e) => setNewItem({ ...newItem, contactInfo: { ...newItem.contactInfo, phone: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input
                        value={newItem.contactInfo.email}
                        onChange={(e) => setNewItem({ ...newItem, contactInfo: { ...newItem.contactInfo, email: e.target.value } })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleListNewItem}>List Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marketplaceItems.map(renderMarketplaceItemCard)}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Accommodation;