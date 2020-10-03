<?php

namespace eCamp\Core\Service;

use eCamp\Core\Entity\User;
use eCamp\Lib\Service\ServiceUtils;
use eCamp\Lib\Mail\MessageData;
use eCamp\Lib\Mail\ProviderInterface;
use Laminas\Authentication\AuthenticationService;

class SendmailService extends AbstractService {
    /** @var ProviderInterface */
    private $mailProvider;

    public function __construct(
        ServiceUtils $serviceUtils,
        AuthenticationService $authenticationService,
        ProviderInterface $mailProvider
    ) {
        parent::__construct($serviceUtils, $authenticationService);

        $this->mailProvider = $mailProvider;
    }

    public function sendRegisterMail(User $user, $key) {
        $data = new MessageData();
        $data->from = "a@b.c";
        $data->to = $user->getUntrustedMailAddress();
        $data->subject = "Registered";
        $data->template = "register";
        $data->data = [
            'user_name' => $user->getDisplayName(),
            'url' => ''
        ];

        $this->mailProvider->sendMail($data);
    }
}
