require 'json'
require 'digest'

module HypergolicNativeDependencyNotices
  def self.verify(directory, project_root = nil)
    manifest = JSON.parse(File.binread(File.join(directory, 'manifest.json')))
    raise 'Unexpected native notice manifest' unless manifest.fetch('schemaVersion') == 1 && manifest.fetch('platform') == 'ios'
    notices = manifest.fetch('components').flat_map { |component| component.fetch('notices') }
    names = notices.map { |notice| notice.fetch('file') }
    raise 'Duplicate or unsafe native notice filename' unless names.uniq == names && names.all? { |name| File.basename(name) == name && name.end_with?('.txt') }
    raise 'Native notice files changed' unless Dir.children(directory).sort == (names + ['manifest.json']).sort
    manifest.fetch('components').each do |component|
      component.fetch('licenseNoticeFiles', []).each do |name|
        raise 'Shared native notice missing' unless names.include?(name)
      end
    end
    if project_root && manifest.key?('mainJavaScriptProfile')
      manifest.fetch('mainJavaScriptProfile').fetch('dependencyInputs').each do |name, expected|
        raise 'Unsafe native notice dependency input' if name.start_with?('/') || name.split('/').include?('..')
        file = File.join(project_root, name)
        raise "Native notice dependency inputs changed: #{name}" unless File.file?(file) && Digest::SHA256.file(file).hexdigest == expected
      end
    end
    notices.each do |notice|
      bytes = File.binread(File.join(directory, notice.fetch('file')))
      raise "Native notice bytes changed: #{notice.fetch('file')}" unless bytes.bytesize == notice.fetch('bytes') && Digest::SHA256.hexdigest(bytes) == notice.fetch('sha256')
    end
  end
end
