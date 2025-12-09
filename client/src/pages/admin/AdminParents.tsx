import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Users, Plus, Search } from "lucide-react";
import { useState } from "react";

export default function AdminParents() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: parents, isLoading } = trpc.admin.getParents.useQuery();

  const filteredParents = parents?.filter((p: any) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Parent Management</h1>
          <p className="text-muted-foreground">Manage parent accounts and student links</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Parent
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Parents ({filteredParents?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : filteredParents && filteredParents.length > 0 ? (
            <div className="space-y-2">
              {filteredParents.map((parent: any) => (
                <div key={parent.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{parent.name || "Unnamed"}</p>
                    <p className="text-sm text-muted-foreground">{parent.email}</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No parents found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
