FROM registry.suse.com/bci/nodejs:22

ARG USERNAME=pulumi
RUN zypper --non-interactive install -y git openssh make awk curl
RUN useradd -ms /bin/bash ${USERNAME}
USER ${USERNAME}

RUN VERSION=3.169.0 && \
    curl -sSL https://get.pulumi.com/ | bash -s -- --version $VERSION && \
    echo "export PATH=$HOME/.pulumi/bin:$PATH" >> $HOME/.bashrc && \
    echo "export PULUMI_HOME=$HOME/.pulumi" >> $HOME/.bashrc

RUN curl -fsSL https://get.pnpm.io/install.sh | sh -

WORKDIR /home/pulumi
