import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MealVoice Food Database Seed...');

  // Clean existing tables
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.callRecord.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.address.deleteMany();
  await prisma.rider.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const commonPassword = await bcrypt.hash('demo1234', 10);

  // 1. Create Core Users
  console.log('Creating demo users...');

  // Customer User
  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@mealvoice.demo',
      passwordHash: commonPassword,
      name: 'Ramesh Kumar',
      phone: '+91 98765 43210',
      role: 'CUSTOMER'
    }
  });

  const primaryCustomer = await prisma.customer.create({
    data: {
      userId: customerUser.id,
      preferredLanguage: 'Kannada / English',
      notes: 'Prefers simple ordering or phone call orders',
      addresses: {
        create: [
          {
            label: 'Home',
            street: '42, 4th Cross, Indiranagar',
            landmark: 'Near BDA Complex',
            city: 'Bengaluru',
            zipcode: '560038',
            isDefault: true
          },
          {
            label: 'Office',
            street: '7th Floor, Tech Park, Outer Ring Road',
            landmark: 'Opposite Metro Station',
            city: 'Bengaluru',
            zipcode: '560103'
          }
        ]
      }
    }
  });

  // Call Agent User
  const agentUser = await prisma.user.create({
    data: {
      email: 'agent@mealvoice.demo',
      passwordHash: commonPassword,
      name: 'Priya Sharma (Senior Call Agent)',
      phone: '+91 98000 11111',
      role: 'CALL_AGENT'
    }
  });

  // Restaurant Admin User
  const restaurantAdminUser = await prisma.user.create({
    data: {
      email: 'restaurant@mealvoice.demo',
      passwordHash: commonPassword,
      name: 'Chef Suresh Menon',
      phone: '+91 97777 88888',
      role: 'RESTAURANT_ADMIN'
    }
  });

  // Rider User
  const riderUser = await prisma.user.create({
    data: {
      email: 'rider@mealvoice.demo',
      passwordHash: commonPassword,
      name: 'Vikram Singh (Rider)',
      phone: '+91 96666 55555',
      role: 'RIDER'
    }
  });

  const primaryRider = await prisma.rider.create({
    data: {
      userId: riderUser.id,
      vehicleType: 'Electric Ather Scooter',
      vehicleNumber: 'KA-01-MV-2026',
      isOnline: true,
      totalEarnings: 3450.0
    }
  });

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mealvoice.demo',
      passwordHash: commonPassword,
      name: 'Ananya Roy (Operations Lead)',
      phone: '+91 99999 00000',
      role: 'OPERATIONS_ADMIN'
    }
  });

  // Additional 45 Customers, 19 Riders, 9 Call Agents
  console.log('Generating additional users, riders, and agents...');
  const additionalCustomers = [];
  for (let i = 1; i <= 45; i++) {
    const u = await prisma.user.create({
      data: {
        email: `customer${i}@demo.com`,
        passwordHash: commonPassword,
        name: `Customer ${i} (${['Vijay', 'Deepak', 'Meena', 'Lakshmi', 'Arun', 'Kavitha'][i % 6]})`,
        phone: `+91 9${String(800000000 + i).padStart(9, '0')}`,
        role: 'CUSTOMER'
      }
    });
    const c = await prisma.customer.create({
      data: {
        userId: u.id,
        preferredLanguage: i % 3 === 0 ? 'Hindi' : i % 2 === 0 ? 'Tamil' : 'English',
        addresses: {
          create: {
            label: 'Home',
            street: `${10 + i}, MG Road Sector ${i % 5 + 1}`,
            landmark: 'Near Central Bus Terminal',
            city: 'Bengaluru',
            zipcode: '560001'
          }
        }
      }
    });
    additionalCustomers.push(c);
  }

  const additionalRiders = [primaryRider];
  for (let i = 1; i <= 19; i++) {
    const ru = await prisma.user.create({
      data: {
        email: `rider${i}@demo.com`,
        passwordHash: commonPassword,
        name: `Rider ${['Karthik', 'Sunil', 'Rajesh', 'Imran', 'Mahesh', 'Ganesh'][i % 6]}`,
        phone: `+91 95${String(10000000 + i).padStart(8, '0')}`,
        role: 'RIDER'
      }
    });
    const r = await prisma.rider.create({
      data: {
        userId: ru.id,
        vehicleType: i % 2 === 0 ? 'TVS iQube EV' : 'Hero Splendor',
        vehicleNumber: `KA-03-GC-${1000 + i}`,
        isOnline: true,
        totalEarnings: 1500 + i * 200
      }
    });
    additionalRiders.push(r);
  }

  // 2. Create 10 Restaurants with Categories & 100+ Menu Items
  console.log('Creating 10 restaurants with full Indian menus...');

  const restaurantDataList = [
    {
      name: 'MealVoice Kitchen',
      cuisine: 'South & North Indian Speciality',
      rating: 4.8,
      deliveryTime: '25-35 mins',
      deliveryFee: 30.0,
      minOrder: 100.0,
      address: '100 Feet Road, Indiranagar, Bengaluru',
      phone: '+91 80 4455 6677',
      isVegOnly: false,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      ownerId: restaurantAdminUser.id,
      categories: [
        {
          name: 'Signature Biryanis',
          items: [
            { name: 'MealVoice Chicken Dum Biryani', description: 'Fragrant basmati rice layered with juicy chicken & secret spices', price: 290.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
            { name: 'Hyderabadi Veg Dum Biryani', description: 'Rich vegetables & paneer dum cooked in traditional clay pot', price: 230.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=600&q=80' },
            { name: 'Mutton Chukka Biryani', description: 'Tender mutton cooked in spicy pepper masala & ghee rice', price: 380.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80' }
          ]
        },
        {
          name: 'South Indian Classics',
          items: [
            { name: 'Ghee Roast Masala Dosa', description: 'Crispy golden dosa roasted in pure cow ghee with potato masala', price: 110.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80' },
            { name: 'Steamed Idli Sambar (4 Pcs)', description: 'Piping hot fluffy rice cakes served with aromatic sambar & 3 chutneys', price: 80.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' },
            { name: 'Malabar Parotta & Chicken Curry', description: 'Flaky layered parottas served with spicy Malabar chicken gravies', price: 240.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80' }
          ]
        },
        {
          name: 'Beverages & Desserts',
          items: [
            { name: 'Kumbakonam Degree Coffee', description: 'Authentic South Indian brass filter coffee made with fresh cow milk', price: 40.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
            { name: 'Chilled Mango Lassi', description: 'Thick creamy yogurt blended with Alphonso mango pulp', price: 90.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=600&q=80' },
            { name: 'Hot Gulab Jamun (2 Pcs)', description: 'Soft melt-in-the-mouth khoya balls soaked in cardamom sugar syrup', price: 70.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' }
          ]
        }
      ]
    },
    {
      name: 'Royal Hyderabadi Biryani House',
      cuisine: 'Biryani, Mughlai, Kebabs',
      rating: 4.7,
      deliveryTime: '30-40 mins',
      deliveryFee: 35.0,
      minOrder: 150.0,
      address: 'Koramangala 5th Block, Bengaluru',
      phone: '+91 80 2233 4455',
      isVegOnly: false,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      categories: [
        {
          name: 'Nizami Biryani',
          items: [
            { name: 'Special Chicken Boneless Biryani', description: 'Tender chicken cubes marinade in spiced yogurt & saffron basmati', price: 320.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80' },
            { name: 'Royal Paneer Tikka Biryani', description: 'Charcoal grilled paneer tikka layered in aromatic long-grain rice', price: 260.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=600&q=80' },
            { name: 'Egg Biryani (2 Eggs)', description: 'Boiled eggs simmered in spicy masala gravy & dum basmati', price: 190.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80' }
          ]
        },
        {
          name: 'Kebabs & Starters',
          items: [
            { name: 'Tandoori Chicken (Half)', description: 'Whole chicken leg marinated in red tandoori masala grilled in clay oven', price: 280.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80' },
            { name: 'Chicken Reshmi Kebab', description: 'Melt-in-mouth chicken breast marinated in cream, cashew paste & spices', price: 310.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80' },
            { name: 'Hara Bhara Kebab', description: 'Spinach, green peas & cottage cheese patties shallow fried', price: 180.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' }
          ]
        }
      ]
    },
    {
      name: 'Sri Murugan Pure Veg Tiffin',
      cuisine: 'South Indian Pure Veg',
      rating: 4.9,
      deliveryTime: '20-30 mins',
      deliveryFee: 25.0,
      minOrder: 80.0,
      address: 'Jayanagar 4th Block, Bengaluru',
      phone: '+91 80 1122 3344',
      isVegOnly: true,
      imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
      categories: [
        {
          name: 'Morning Breakfast Special',
          items: [
            { name: 'Rava Onion Masala Dosa', description: 'Crispy semolina dosa laced with chopped onions & potato masala', price: 120.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80' },
            { name: 'Medu Vada (2 Pcs)', description: 'Crispy fried lentil donuts served with chutney & coconut sambar', price: 60.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' },
            { name: 'Khara Bath & Kesari Bath Combo', description: 'Spicy semolina upma accompanied by sweet pineapple kesari bath', price: 90.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' },
            { name: 'Podi Thatte Idli', description: 'Large soft steamed idli drizzled with gun powder masala & ghee', price: 75.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80' }
          ]
        }
      ]
    },
    {
      name: 'Punjab Express Dhaba',
      cuisine: 'North Indian, Tandoori, Curries',
      rating: 4.6,
      deliveryTime: '30-40 mins',
      deliveryFee: 30.0,
      minOrder: 150.0,
      address: 'HSR Layout Sector 1, Bengaluru',
      phone: '+91 80 5566 7788',
      isVegOnly: false,
      imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
      categories: [
        {
          name: 'Main Course Curries',
          items: [
            { name: 'Paneer Butter Masala', description: 'Cottage cheese cubes cooked in rich tomato cashew butter gravy', price: 240.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80' },
            { name: 'Butter Chicken (Punjabi Style)', description: 'Tender chicken tikka simmered in creamy tomato gravy with fenugreek', price: 290.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80' },
            { name: 'Dal Makhani', description: 'Black lentils slow cooked overnight with butter & cream', price: 210.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80' },
            { name: 'Garlic Butter Naan (2 Pcs)', description: 'Leavened flatbread brushed with garlic butter fresh from tandoor', price: 70.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80' }
          ]
        }
      ]
    },
    {
      name: 'Malabar Spice Villa',
      cuisine: 'Kerala, Seafood, South Indian',
      rating: 4.7,
      deliveryTime: '35-45 mins',
      deliveryFee: 35.0,
      minOrder: 200.0,
      address: 'Whitefield Main Road, Bengaluru',
      phone: '+91 80 7788 9900',
      isVegOnly: false,
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
      categories: [
        {
          name: 'Kerala Delicacies',
          items: [
            { name: 'Kerala Fish Curry Meals', description: 'Traditional Matta rice served with spicy coconut fish curry & 4 sides', price: 260.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80' },
            { name: 'Chicken Roast with Appam (3 Pcs)', description: 'Lacy rice pancakes served with spicy Kerala style roasted chicken gravy', price: 270.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80' }
          ]
        }
      ]
    },
    {
      name: "Amma's South Meals",
      cuisine: 'Traditional Thali, South Indian',
      rating: 4.8,
      deliveryTime: '20-30 mins',
      deliveryFee: 20.0,
      minOrder: 90.0,
      address: 'Malleswaram 8th Main, Bengaluru',
      phone: '+91 80 9988 7766',
      isVegOnly: true,
      imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80',
      categories: [
        {
          name: 'Unlimited Meals',
          items: [
            { name: 'Full South Indian Veg Meals', description: 'Steamed Sona Masoori rice, sambar, rasam, kootu, poriyal, curd & appalam', price: 140.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80' },
            { name: 'Mini Chapati & Rice Combo', description: '2 Wheat Chapatis with Paneer Gravy, Sambar Rice & Curd Rice', price: 120.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80' }
          ]
        }
      ]
    },
    {
      name: 'Wok & Roll Chinese Bowl',
      cuisine: 'Indo-Chinese, Noodles, Fried Rice',
      rating: 4.5,
      deliveryTime: '25-35 mins',
      deliveryFee: 30.0,
      minOrder: 120.0,
      address: 'BTM Layout 2nd Stage, Bengaluru',
      phone: '+91 80 3344 5566',
      isVegOnly: false,
      imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
      categories: [
        {
          name: 'Noodles & Rice',
          items: [
            { name: 'Schezwan Chicken Fried Rice', description: 'Wok-tossed spicy rice with shredded chicken & veggies', price: 210.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80' },
            { name: 'Veg Hakka Noodles', description: 'Classic stir-fried noodles with bell peppers, cabbage & carrots', price: 170.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80' },
            { name: 'Chilli Chicken Gravy', description: 'Crispy fried chicken in spicy soy garlic gravy with green chillies', price: 230.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80' }
          ]
        }
      ]
    },
    {
      name: 'Madurai Kari Kadai',
      cuisine: 'Chettinad, Non-Veg Special',
      rating: 4.7,
      deliveryTime: '30-40 mins',
      deliveryFee: 35.0,
      minOrder: 180.0,
      address: 'Electronic City Phase 1, Bengaluru',
      phone: '+91 80 6677 8899',
      isVegOnly: false,
      imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80',
      categories: [
        {
          name: 'Madurai Specials',
          items: [
            { name: 'Madurai Pepper Chicken Fry', description: 'Spicy black pepper marinated chicken stir-fried in gingelly oil', price: 250.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80' },
            { name: 'Kari Dosa (Mutton Omelette Dosa)', description: 'Thick dosa topped with minced mutton fry & egg omelette layer', price: 290.0, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80' }
          ]
        }
      ]
    },
    {
      name: 'Bangalore Chai & Snacks Corner',
      cuisine: 'Tea, Coffee, Snacks, Chaat',
      rating: 4.6,
      deliveryTime: '15-25 mins',
      deliveryFee: 20.0,
      minOrder: 50.0,
      address: 'Commercial Street, Bengaluru',
      phone: '+91 80 4433 2211',
      isVegOnly: true,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      categories: [
        {
          name: 'Chai & Snacks',
          items: [
            { name: 'Kulhad Ginger Masala Chai (Flasket 500ml)', description: 'Freshly brewed kadak tea infused with ginger & green cardamom', price: 110.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
            { name: 'Hot Crispy Onion Samosa (4 Pcs)', description: 'Crispy fried triangular pastry stuffed with spiced onions & mint dip', price: 60.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
            { name: 'Aloo Tikki Chaat', description: 'Crispy potato patties topped with sweetened curd, tamarind & green chutney', price: 90.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' }
          ]
        }
      ]
    },
    {
      name: 'Sweet Bengal Sweets & Desserts',
      cuisine: 'Bengali Sweets, Mithai, Desserts',
      rating: 4.9,
      deliveryTime: '20-30 mins',
      deliveryFee: 25.0,
      minOrder: 100.0,
      address: 'Marathahalli Bridge, Bengaluru',
      phone: '+91 80 8899 0011',
      isVegOnly: true,
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
      categories: [
        {
          name: 'Traditional Sweets',
          items: [
            { name: 'Sponge Rasgulla (4 Pcs)', description: 'Soft spongy cottage cheese balls soaked in light sugar syrup', price: 100.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
            { name: 'Kesar Rasmalai (2 Pcs)', description: 'Flat cottage cheese discs soaked in saffron cardamom flavoured milk', price: 120.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
            { name: 'Motichoor Ladoo (500g)', description: 'Tiny boondi balls fried in ghee cooked with sugar syrup & pistachios', price: 260.0, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' }
          ]
        }
      ]
    }
  ];

  const createdRestaurants = [];
  for (const rData of restaurantDataList) {
    const { categories, ...restInfo } = rData;
    // Create restaurant without nested categories to avoid Prisma type issues
    const restaurant = await prisma.restaurant.create({ data: restInfo });

    // Create categories and items separately
    for (let catIdx = 0; catIdx < categories.length; catIdx++) {
      const cat = categories[catIdx];
      const category = await prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: cat.name,
          sortOrder: catIdx
        }
      });
      for (const item of cat.items) {
        await prisma.menuItem.create({
          data: {
            restaurantId: restaurant.id,
            categoryId: category.id,
            name: item.name,
            description: item.description,
            price: item.price,
            isVeg: item.isVeg,
            imageUrl: item.imageUrl
          }
        });
      }
    }

    // Reload with categories and items included
    const loaded = await prisma.restaurant.findUnique({
      where: { id: restaurant.id },
      include: { categories: { include: { items: true } } }
    });
    createdRestaurants.push(loaded!);
  }

  // 3. Create Sample Orders Across All Sources (ONLINE, PHONE_CALL, EASY_ORDER, AGENT)
  console.log('Generating 100 sample orders to demonstrate Accessibility Differentiation...');

  const sources: string[] = ['ONLINE', 'PHONE_CALL', 'EASY_ORDER', 'AGENT'];
  const statuses: string[] = [
    'DELIVERED',
    'OUT_FOR_DELIVERY',
    'PICKED_UP',
    'READY_FOR_PICKUP',
    'PREPARING',
    'CONFIRMED',
    'PENDING'
  ];

  for (let i = 1; i <= 100; i++) {
    const source = sources[i % 4];
    const status = statuses[i % 7];
    const rest = createdRestaurants[i % createdRestaurants.length];
    const customer = additionalCustomers[i % additionalCustomers.length];
    const menuItem = rest.categories[0]?.items[0];

    if (!menuItem) continue;

    const qty = 1 + (i % 3);
    const subtotal = menuItem.price * qty;
    const deliveryFee = rest.deliveryFee;
    const tax = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + deliveryFee + tax;
    const orderNum = `GC-2026-${String(i).padStart(6, '0')}`;

    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 3600 * 1000));

    const order = await prisma.order.create({
      data: {
        orderNumber: orderNum,
        customerId: customer.id,
        restaurantId: rest.id,
        source,
        status,
        subtotal,
        deliveryFee,
        tax,
        totalAmount,
        paymentMethod: i % 2 === 0 ? 'COD' : 'MOCK_UPI',
        paymentStatus: status === 'DELIVERED' ? 'PAID' : 'PENDING',
        deliveryAddress: `${100 + i}, MG Road Sector ${i % 5 + 1}, Bengaluru`,
        createdAt,
        updatedAt: createdAt,
        items: {
          create: [
            {
              menuItemId: menuItem.id,
              name: menuItem.name,
              price: menuItem.price,
              quantity: qty
            }
          ]
        },
        statusHistory: {
          create: [
            { status: 'PENDING', note: `Order created via ${source}`, createdAt },
            ...(status !== 'PENDING' ? [{ status, note: `Status transitioned to ${status}`, createdAt }] : [])
          ]
        }
      }
    });

    if (source === 'PHONE_CALL' || source === 'AGENT') {
      await prisma.callRecord.create({
        data: {
          customerId: customer.id,
          agentId: agentUser.id,
          phoneNumber: `+91 9${String(800000000 + i).padStart(9, '0')}`,
          callStatus: 'COMPLETED',
          callStartTime: new Date(createdAt.getTime() - 120000),
          callEndTime: createdAt,
          orderId: order.id,
          notes: `Customer requested ${qty}x ${menuItem.name} via Phone Call`
        }
      });
    }

    if (['ASSIGNED', 'RIDER_ACCEPTED', 'AT_RESTAURANT', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
      const rider = additionalRiders[i % additionalRiders.length];
      await prisma.delivery.create({
        data: {
          orderId: order.id,
          riderId: rider.id,
          assignedAt: createdAt,
          acceptedAt: createdAt,
          pickedUpAt: status === 'DELIVERED' ? createdAt : null,
          deliveredAt: status === 'DELIVERED' ? createdAt : null,
          estimatedMinutes: 25
        }
      });
    }
  }

  console.log('✅ Seed completed successfully!');
  console.log('--------------------------------------------------');
  console.log('DEMO CREDENTIALS:');
  console.log('Customer: customer@mealvoice.demo / demo1234');
  console.log('Call Agent: agent@mealvoice.demo / demo1234');
  console.log('Restaurant Admin: restaurant@mealvoice.demo / demo1234');
  console.log('Rider: rider@mealvoice.demo / demo1234');
  console.log('Admin: admin@mealvoice.demo / demo1234');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
