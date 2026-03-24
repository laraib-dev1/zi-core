import React, { useState } from "react";
import { Package, Search, Check, Calendar, Clock, Image as ImageIcon, Globe, Heart, ShoppingCart, User, Star, MapPin, MessageSquare, Eye, Edit, Trash2, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/ui/StatusBadge";
import ProductCard from "@/components/products/ProductCard";

// Component categories with examples
const componentCategories = [
  {
    id: "buttons",
    name: "Buttons",
    description: "Outline / Grey / Default / Hover / Onpress",
    components: [
      {
        name: "Outline Button",
        example: (
          <button className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Add
          </button>
        ),
      },
      {
        name: "Grey Fill Button",
        example: (
          <button className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
            Add
          </button>
        ),
      },
      {
        name: "Primary Button",
        example: (
          <button 
            className="px-5 py-2 text-white rounded-lg transition-colors theme-button"
            style={{ backgroundColor: "var(--theme-primary)" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--theme-dark)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--theme-primary)"}
          >
            Add
          </button>
        ),
      },
      {
        name: "Button with Icon",
        example: <Button className="theme-button"><Plus className="w-4 h-4" /> Add Item</Button>,
      },
      {
        name: "Loading Button",
        example: <Button className="theme-button" loading>Loading...</Button>,
      },
    ],
  },
  {
    id: "inputs",
    name: "Inputs",
    description: "Default / Active / with info / valid",
    components: [
      {
        name: "Text Input",
        example: (
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="placeholder" />
          </div>
        ),
      },
      {
        name: "Text Input (Active)",
        example: (
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="placeholder" autoFocus />
          </div>
        ),
      },
      {
        name: "Textarea",
        example: (
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Enter description..." rows={4} />
          </div>
        ),
      },
      {
        name: "Select Dropdown",
        example: (
          <div className="space-y-2">
            <Label>Category</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Category 1</SelectItem>
                <SelectItem value="2">Category 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ),
      },
    ],
  },
  {
    id: "pickers",
    name: "Pickers",
    description: "Date / Time / Color / Image / Country Code",
    components: [
      {
        name: "Date Picker",
        example: (
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Input type="date" />
          </div>
        ),
      },
      {
        name: "Time Picker",
        example: (
          <div className="space-y-2">
            <Label>Select Time</Label>
            <Input type="time" />
          </div>
        ),
      },
      {
        name: "Color Picker",
        example: (
          <div className="space-y-2">
            <Label>Select Color</Label>
            <Input type="color" className="h-12 w-full" />
          </div>
        ),
      },
      {
        name: "Image Picker",
        example: (
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <Input type="file" accept="image/*" />
          </div>
        ),
      },
    ],
  },
  {
    id: "cards",
    name: "Item Card",
    description: "Show Item Hover",
    components: [
      {
        name: "Product Card",
        example: (
          <div className="w-full max-w-[200px]">
            <ProductCard
              id="demo-1"
              name="Sample Product"
              price={99.99}
              image="/product.png"
            />
          </div>
        ),
      },
      {
        name: "Info Card",
        example: (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Card Title</h3>
                <p className="text-sm text-gray-600">Card description</p>
              </div>
            </div>
            <p className="text-gray-700">Card content goes here...</p>
          </Card>
        ),
      },
    ],
  },
  {
    id: "text",
    name: "Text",
    description: "Headings, Paragraphs, Labels",
    components: [
      {
        name: "Heading 1",
        example: <h1 className="text-4xl font-bold theme-heading">Heading 1</h1>,
      },
      {
        name: "Heading 2",
        example: <h2 className="text-3xl font-bold theme-heading">Heading 2</h2>,
      },
      {
        name: "Heading 3",
        example: <h3 className="text-2xl font-semibold theme-heading">Heading 3</h3>,
      },
      {
        name: "Paragraph",
        example: <p className="text-gray-700">This is a paragraph text with default styling.</p>,
      },
      {
        name: "Label",
        example: <Label className="text-sm font-medium">Form Label</Label>,
      },
    ],
  },
  {
    id: "icons",
    name: "Icons",
    description: "Lucide React Icons",
    components: [
      {
        name: "Common Icons",
        example: (
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-2">
              <Heart className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-500">Heart</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-500">Cart</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <User className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-500">User</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-500">Star</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MapPin className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-500">Location</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MessageSquare className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-500">Message</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Eye className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-500">View</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Edit className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-500">Edit</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Trash2 className="w-6 h-6 text-gray-600" />
              <span className="text-xs text-gray-500">Delete</span>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "badges",
    name: "Badges",
    description: "Status and Labels",
    components: [
      {
        name: "Status Badges",
        example: (
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="pending" type="order" />
            <StatusBadge status="completed" type="order" />
            <StatusBadge status="cancel" type="order" />
            <StatusBadge status="active" type="product" />
            <StatusBadge status="inactive" type="product" />
            <StatusBadge status="read" type="query" />
            <StatusBadge status="replied" type="query" />
          </div>
        ),
      },
      {
        name: "Custom Badges",
        example: (
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge className="bg-blue-500">Custom</Badge>
          </div>
        ),
      },
    ],
  },
];

// SP Standards Kit
const spStandards = {
  sizes: "4, 6, 8, 12, 16, 20, 24, 28, 40, 48",
  radius: "sm: 6px / md: 8px / lg: 12px / xl: 100px",
  inputs: {
    height: "40px / 48px",
    width: "175px / 360px / Full",
    states: "Title / Placeholder / Info / Validation",
  },
  buttons: {
    width: "100px / 175px / 380px",
    styles: "Outline / Fill / Hover",
    radius: "6px / 10px / Full",
    text: "Size: 18px, Color: White",
  },
};

export default function SpComponentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["buttons", "inputs"])); // Default expanded

  const categories = ["All", "Buttons", "Inputs", "Text", "Sidebar Tabs", "Options Menu", "Categories", "Product"];

  const filteredCategories = componentCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold theme-heading">SP Components</h1>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="flex flex-wrap gap-2 border-b border-gray-200 pb-2 bg-transparent h-auto p-0">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className={`px-4 py-2 rounded-lg font-medium transition-all data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-gray-100`}
              style={
                selectedCategory === cat
                  ? { backgroundColor: "var(--theme-primary)" }
                  : {}
              }
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Components List */}
      <div className="space-y-6 mb-8">
        {componentCategories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            No components available.
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            No components found matching your search.
          </div>
        ) : (
          filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            return (
              <Card key={category.id} className="overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="font-semibold theme-heading">{category.name}</h2>
                    <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                  </div>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-5 h-5 flex items-center justify-center border-2 rounded transition-colors ${
                      isExpanded 
                        ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]" 
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isExpanded ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : null}
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.components.map((component, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-3">{component.name}</h3>
                          <div className="flex items-start justify-center">
                            {component.example}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* SP Standards Kit - Moved to Last */}
      <div className="mt-8 p-6 rounded-xl border" style={{ 
        backgroundColor: "var(--theme-light, #f5f5f5)", 
        borderColor: "var(--theme-light)" 
      }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border-2" style={{ borderColor: "var(--theme-primary)" }}>
            <Package className="w-6 h-6" style={{ color: "var(--theme-primary)" }} />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg theme-heading mb-1">SP Standards Kit</h2>
            <p className="text-sm text-gray-600 mb-4">Developer must follow the given standards</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700 mb-1">Sizes:</p>
                <p className="text-gray-600">+ {spStandards.sizes}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Radius:</p>
                <p className="text-gray-600">+ {spStandards.radius}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Inputs:</p>
                <p className="text-gray-600">H {spStandards.inputs.height}</p>
                <p className="text-gray-600">W {spStandards.inputs.width}</p>
                <p className="text-gray-600">{spStandards.inputs.states}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Buttons:</p>
                <p className="text-gray-600">+ {spStandards.buttons.width}</p>
                <p className="text-gray-600">{spStandards.buttons.styles}</p>
                <p className="text-gray-600">Rounded {spStandards.buttons.radius}</p>
                <p className="text-gray-600">Text size 16 color white</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
