import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@choblue/ui/dialog";
import { Button } from "@choblue/ui/button";
import { Input } from "@choblue/ui/input";
import { Textarea } from "@choblue/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@choblue/ui/select";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
        Open Dialog
      </DialogTrigger>
      <DialogContent className="w-[450px]">
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a dialog description. You can put any content here.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-0">
          <p className="text-sm">
            This is the main content area of the dialog. You can add forms,
            text, or any other React components here.
          </p>
        </div>
        <DialogFooter>
          <DialogClose className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Cancel
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const DeleteConfirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="rounded-md bg-danger px-4 py-2 font-medium text-danger-foreground hover:bg-danger/90">
        Delete Product
      </DialogTrigger>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-0">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-semibold">Product: Americano</p>
            <p className="text-sm text-muted-foreground">Category: Coffee</p>
            <p className="text-sm text-muted-foreground">Price: $3.50</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Cancel
          </DialogClose>
          <Button variant="danger">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const PaymentConfirmation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
        Pay $24.50
      </DialogTrigger>
      <DialogContent className="w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Payment</DialogTitle>
          <DialogDescription>
            Please review the order details before proceeding with the payment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6 pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Americano x 2</span>
              <span>$7.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Caffe Latte x 1</span>
              <span>$4.50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Croissant x 3</span>
              <span>$9.00</span>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>$20.50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%)</span>
              <span>$2.05</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Service Fee</span>
              <span>$1.95</span>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>$24.50</span>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-sm font-medium">Payment Method</p>
            <p className="text-sm text-muted-foreground">Credit Card</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Cancel
          </DialogClose>
          <Button>Confirm Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const FormDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
        Add Product
      </DialogTrigger>
      <DialogContent className="w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the product details below. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6 pt-0">
          <div className="space-y-2">
            <label htmlFor="product-name" className="text-sm font-medium">
              Product Name
            </label>
            <Input
              id="product-name"
              type="text"
              placeholder="e.g., Caffe Latte"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Category
            </label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coffee">Coffee</SelectItem>
                <SelectItem value="beverage">Beverage</SelectItem>
                <SelectItem value="dessert">Dessert</SelectItem>
                <SelectItem value="food">Food</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              Price
            </label>
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Product description..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Cancel
          </DialogClose>
          <Button>Add Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithLongContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">
        View Terms
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] w-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>
            Please read the following terms and conditions carefully.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-6 pt-0 text-sm">
          <section>
            <h3 className="mb-2 font-semibold">1. Introduction</h3>
            <p className="text-muted-foreground">
              Welcome to our POS system. By using this service, you agree to
              comply with and be bound by the following terms and conditions of
              use, which together with our privacy policy govern our
              relationship with you in relation to this application.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">2. Use of Service</h3>
            <p className="text-muted-foreground">
              The content of the pages of this application is for your general
              information and use only. It is subject to change without notice.
              Neither we nor any third parties provide any warranty or guarantee
              as to the accuracy, timeliness, performance, completeness or
              suitability of the information and materials found or offered on
              this application for any particular purpose.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">3. Data Processing</h3>
            <p className="text-muted-foreground">
              Your use of this application and any dispute arising out of such
              use of the application is subject to the laws of your jurisdiction.
              We process all transaction data in accordance with applicable data
              protection regulations including GDPR and local privacy laws.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">4. Payment Terms</h3>
            <p className="text-muted-foreground">
              All payments processed through this system are subject to
              verification and authorization. We reserve the right to refuse or
              cancel any transaction for any reason, including but not limited
              to: product or service availability, errors in product or pricing
              information, or problems identified by our credit and fraud
              avoidance department.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">5. Limitation of Liability</h3>
            <p className="text-muted-foreground">
              In no event shall we be liable for any direct, indirect,
              incidental, special, consequential or exemplary damages, including
              but not limited to, damages for loss of profits, goodwill, use,
              data or other intangible losses resulting from the use of or
              inability to use the service.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">6. Modifications</h3>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. You should
              check this page regularly to take notice of any changes we make, as
              they are binding on you. Some of the provisions contained in these
              terms may also be superseded by provisions or notices published
              elsewhere on our application.
            </p>
          </section>
          <section>
            <h3 className="mb-2 font-semibold">7. Contact Information</h3>
            <p className="text-muted-foreground">
              If you have any questions about these Terms, please contact us at
              support@example.com. We will make every effort to respond to your
              inquiry within 2 business days.
            </p>
          </section>
        </div>
        <DialogFooter>
          <DialogClose className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
            Close
          </DialogClose>
          <Button>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
