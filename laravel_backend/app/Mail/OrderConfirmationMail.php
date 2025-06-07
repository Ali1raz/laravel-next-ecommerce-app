<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Bill;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $bill;

    /**
     * Create a new message instance.
     */
    public function __construct(Bill $bill)
    {
        $this->bill = $bill;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Order Confirmation - Your Order Will Be Delivered Soon')
            ->view('emails.order-confirmation');
    }
}
